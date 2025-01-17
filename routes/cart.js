const express = require('express');
const { Cart, Menu } = require('../server');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Get cart for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.menuId');
        if (!cart) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { menuId, quantity, customizations, price } = req.body;

        // Find or create the cart for the user
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [], totalPrice: 0 });
        }

        // Check if item already exists in the cart
        const existingItem = cart.items.find(item => item.menuId.toString() === menuId && JSON.stringify(item.customizations) === JSON.stringify(customizations));
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ menuId, quantity, customizations, price });
        }

        // Update total price
        cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);

        await cart.save();
        res.status(201).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update item quantity in cart
router.patch('/update/:itemId', authenticateToken, async (req, res) => {
    try {
        const { quantity } = req.body;

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;

        // Update total price
        cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove item from cart
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

        // Update total price
        cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user.id });
        res.status(200).json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
