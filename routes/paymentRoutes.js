const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const stripe = require('stripe')('sk_test_51QjvRCBpoKRfd7wJLjZzoIYDXy2zf8qEL1QuEEAL4lUNYc9aZck3CyaHTVrvpxzLW5Scl0NfP2TURtltOSJ81D5P00uf61wd7K'); // Replace with your Stripe secret key

// Create a Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, userId, currency = 'usd' } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: 'Amount and user ID are required.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      metadata: { userId },
    });

    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
});
    