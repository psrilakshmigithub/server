const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/:category', async (req, res) => {
  try {
    const items = await Product.find({ category: req.params.category });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
