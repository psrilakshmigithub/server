const express = require('express');
const router = express.Router();
const Beverage = require('../models/Beverage');

// Get all beverages
router.get('/', async (req, res) => {
  try {
    const beverages = await Beverage.find();
    res.json(beverages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beverages' });
  }
});

// Add a new beverage
router.post('/', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const beverage = new Beverage({ name, price, image });
    await beverage.save();
    res.status(201).json(beverage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add beverage' });
  }
});

module.exports = router;
