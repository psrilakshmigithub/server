const express = require('express');
const router = express.Router();
const Topping = require('../models/Topping');

// Get all toppings
router.get('/', async (req, res) => {
  try {
    const toppings = await Topping.find();
    res.json(toppings);
  } catch (err) {
    console.error('Error fetching toppings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
