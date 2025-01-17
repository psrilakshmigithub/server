const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
// router.get('/', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     console.error('Error fetching products:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });



// Get all products or filter by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query; // Get category from query params
    const query = category ? { category } : {}; // If category is provided, filter by it
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/beverages', async (req, res) => {
  try {
    // Log to verify the request
    console.log('Fetching beverages...');
    const beverages = await Product.find({ category: 'Beverages' });
    res.json(beverages);
  } catch (error) {
    console.error('Error fetching beverages:', error);
    res.status(500).json({ error: 'Failed to fetch beverages', details: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
