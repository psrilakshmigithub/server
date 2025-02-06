const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use the secret key from the .env file


// Create a Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, userId, currency} = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: 'Amount and user ID are required.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      metadata: { userId },
    });
    console.log('Payment Intent Response:', paymentIntent);
      
    res.status(201).json({ clientSecret: paymentIntent.client_secret });     
    console.log('Payment clientSecret Response:', paymentIntent.client_secret );                                                                                                                                                                                                                      
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
});
module.exports = router;