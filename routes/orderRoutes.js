const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');



// Complete order and move cart to orders collection
router.post('/complete-order', async (req, res) => {
  try {
    const { userId, paymentIntentId, paymentOption } = req.body;

    // Find the active cart for the user
    const cart = await Cart.findOne({ userId, status: 'active' }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ error: 'No active cart found.' });
    }

    // Create a new order from the cart
    const order = new Order({
      userId: cart.userId,
      items: cart.items,
      deliveryType: cart.deliveryType,
      scheduleTime: cart.scheduleTime,
      instructions: cart.instructions,
      totalPrice: cart.totalPrice,
      paymentIntentId: paymentOption === 'online' ? paymentIntentId : null, // Save the payment intent ID if paid online
      paymentOption, // Save the payment option
      status: paymentOption === 'online' ? 'confirmed' : 'payment pending', // Mark as completed if paid online
      createdAt: new Date(),
    });

    // Save the new order
    await order.save();

    // Mark the cart as completed
    cart.status = 'completed';
    await cart.save();

    res.status(200).json({ message: 'Order completed successfully!', order });

    // Emit event to notify admin of the new order
    req.wss.clients.forEach(client => {
      console.log("client",client.readyState)
      if (client.readyState === WebSocket.OPEN) {
        console.log("client send");
        client.send(JSON.stringify(order));
        console.log("client sent successfully");
      }
    });
  } catch (error) {
    console.error('Error completing order:', error.message);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// Complete order and move cart to orders collection
router.post('/accept', async (req, res) => {
  try {
    const { orderId, preparationTime} = req.body;

    // Find the active cart for the user
    const acceptOrder = await Order.findOne({ orderId, status: 'confirmed' })
    if (!acceptOrder) {
      return res.status(404).json({ error: 'No active order found.' });
    }

    acceptOrder.status = 'accepted';
    acceptOrder.preparationTime = preparationTime;  

    // Save the new order
    await acceptOrder.save();
    
    res.status(200).json({ message: 'Order completed successfully!', acceptOrder });
 // Notify the client that the order has been accepted
 req.wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'order-accepted', orderId }));
  }
});
  } catch (error) {
    console.error('Error completing order:', error.message);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// decline order 
router.post('/decline', async (req, res) => {
  try {
    const { orderId, reason} = req.body;

    // Find the active cart for the user
    const declineOrder = await Order.findOne({orderId, status: 'confirmed' })
    if (!declineOrder) {
      return res.status(404).json({ error: 'No active order found.' });
    }

    declineOrder.status = 'declined';
    declineOrder.reason = reason;  

    // Save the new order
    await declineOrder.save();
    
    res.status(200).json({ message: 'Order declined!', declineOrder });
     // Notify the client that the order has been declined
     req.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'order-declined', orderId, reason }));
      }
    });
    
  } catch (error) {
    console.error('Error completing order:', error.message);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});


// Fetch Cart (Pending Orders for User)
router.get('/cart/:userId', async (req, res) => {
  try {
    const cartItems = await Order.find({ userId: req.params.userId, status: 'pending' }).populate('productId');
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

// Update Order (e.g., Confirm Order or Update Delivery Details)
router.put('/cart/:itemId', async (req, res) => {
  try {
    const { status, deliveryType, contactInfo, scheduledTime, tip,userId, quantity  } = req.body;
     const order = await Order.findById(req.params.itemId).populate('productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Update quantity and total price
    if (quantity !== undefined) {
      order.quantity = quantity;
      order.totalPrice = order.productId.price * quantity; // Recalculate total price
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (status) {
      order.status = status;
    }

    if (deliveryType) {
      order.deliveryType = deliveryType;
      if (deliveryType === 'delivery') {
        order.contactInfo = contactInfo;
      }
    }

    if (scheduledTime) {
      order.scheduledTime = scheduledTime;
    }

    if (tip !== undefined) {
      order.tip = tip;
    }
    console.log("saving order change",order);
    await order.save();
    console.log("saved ");
    const cartItems = await Order.find({ userId: userId, status: 'pending' }).populate('productId');
    res.json(cartItems);   
    console.log("response ",res);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Confirm Orders
router.post('/confirm', async (req, res) => {
  try {
    const { userId, deliveryType, contactInfo, scheduledTime, tip, instructions } = req.body;

    const updatedOrders = await Order.updateMany(
      { userId, status: 'pending' },
      {
        $set: {
          status: 'confirmed',
          deliveryType,
          contactInfo: deliveryType === 'delivery' ? contactInfo : null,
          scheduledTime: scheduledTime || null,
          tip: tip || 0,
          instructions: instructions || '',
        },
      }
    );    
    res.json({ message: 'Orders confirmed successfully.', updatedOrders });
  } catch (err) {
    console.error('Error confirming orders:', err.message);
    res.status(500).json({ error: 'Failed to confirm orders.' });
  }
});

// Delete Order
router.delete('/cart/:itemId', async (req, res) => {
  try {
    console.log("deleteOrder item id",req.params.itemId);
    const deletedOrder = await Order.findByIdAndDelete(req.params.itemId);
    console.log("deleteOrder",deletedOrder);
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    const cartItems = await Order.find({ userId: req.body.userId, status: 'pending' }).populate('productId');
    res.json(cartItems);   
    
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

// Get All Orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({status:'confirmed'}).populate('items.productId');;
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Get orders by user ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate('items.productId');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
