const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

router.post('/cart/checkout', async (req, res) => {
  try {
    const { userId, paymentDetails } = req.body;

    const cart = await Cart.findOne({ userId, status: 'active' }).populate('items.orderId');
    if (!cart) {
      return res.status(404).json({ error: 'No active cart found.' });
    }

    // Process payment (use Stripe or another payment gateway)
    const paymentSuccess = await processPayment(cart.totalPrice, paymentDetails);
    if (!paymentSuccess) {
      return res.status(400).json({ error: 'Payment failed.' });
    }

    // Mark the cart as completed
    cart.status = 'completed';
    await cart.save();

    // Update the status of all orders in the cart
    await Order.updateMany(
      { _id: { $in: cart.items.map((item) => item.orderId._id) } },
      { $set: { status: 'completed' } }
    );

    res.status(200).json({ message: 'Checkout successful!', cart });
  } catch (error) {
    console.error('Error during checkout:', error.message);
    res.status(500).json({ error: 'Checkout failed.' });
  }
});


// Get cart by user ID
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { items: [], totalPrice: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  const { userId, productId, quantity, extras } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [], totalPrice: 0 });

    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        extras,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity + (item.extras?.toppings?.length || 0) * 1.75,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity + (item.extras?.toppings?.length || 0) * 1.75,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;