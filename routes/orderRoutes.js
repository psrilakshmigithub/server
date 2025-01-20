const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require('stripe')('your_stripe_secret_key');

// Create Order
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      productId,
      size,
      wingsFlavor,
      sides,
      drinks,
      toppings,
      quantity,
      totalPrice,
      deliveryType,
      contactInfo,
      scheduledTime,
      tip,
    } = req.body;

    console.log('Order Payload Received:', {
      userId,
      productId,
      size,
      wingsFlavor,
      sides,
      drinks,
      toppings,
      quantity,
      totalPrice,
      deliveryType,
      contactInfo,
      scheduledTime,
      tip,
    });

    // Validate required fields
    if (!userId || !totalPrice ) {
      console.error('Validation Error: Missing required fields.');
      return res.status(400).json({ error: 'Missing required fields: userId, totalPrice, deliveryType, or scheduledTime.' });
    }

    if (deliveryType === 'delivery' && !contactInfo) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders.' });
    }

    // Normalize drinks and validate
    const validDrinks = drinks?.filter((drink) => drink.quantity > 0) || [];
    let resolvedProductId = productId;

    if (!resolvedProductId && validDrinks.length) {
      const genericBeverageProduct = await Product.findOne({ category: 'Beverages', name: 'Beverages' });
      if (!genericBeverageProduct) {
        console.error('Generic Beverages product not found.');
        return res.status(400).json({ error: 'Generic Beverages product not found.' });
      }
      resolvedProductId = genericBeverageProduct._id;
    }

    if (!resolvedProductId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const order = new Order({
      userId,
      productId: resolvedProductId,
      size,
      wingsFlavor,
      sides,
      drinks: validDrinks,
      toppings,
      quantity: quantity || 1, // Default quantity to 1 if missing
      totalPrice,
      deliveryType,
      contactInfo: deliveryType === 'delivery' ? contactInfo : null,
      scheduledTime,
      tip: tip || 0,
    });

    await order.save();
    console.log('Order successfully saved:', order);
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ error: 'Failed to create order.' });
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
router.put('/cart/:orderId', async (req, res) => {
  try {
    const { status, deliveryType, contactInfo, scheduledTime, tip } = req.body;
    const order = await Order.findById(req.params.orderId);

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

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Confirm Orders
router.post('/confirm', async (req, res) => {
  try {
    const { userId, deliveryType, contactInfo, scheduledTime, tip } = req.body;

    const updatedOrders = await Order.updateMany(
      { userId, status: 'pending' },
      {
        $set: {
          status: 'confirmed',
          deliveryType,
          contactInfo: deliveryType === 'delivery' ? contactInfo : null,
          scheduledTime,
          tip: tip || 0,
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
router.delete('/:orderId', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ message: 'Order deleted successfully.' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

// Get All Orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('productId');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});



module.exports = router;
