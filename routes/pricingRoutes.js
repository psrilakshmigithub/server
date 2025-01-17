const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { itemId, extras } = req.body;
    const item = await Product.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    let totalPrice = item.price;
    if (extras && extras.toppings) {
      totalPrice += extras.toppings.length * 1.75; // $1.75 per extra topping
    }

    res.json({ basePrice: item.price, totalPrice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
