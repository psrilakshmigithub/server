const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Use environment variables in production

// Google Authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      let user = await User.findOne({ googleId: req.user.id });
      if (!user) {
        user = new User({
          googleId: req.user.id,
          name: req.user.displayName,
          email: req.user.emails[0].value,
        });
        await user.save();
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error) {
      console.error('Google Auth Error:', error.message);
      res.status(500).send('Authentication failed');
    }
  }
);

// Facebook Authentication
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      let user = await User.findOne({ facebookId: req.user.id });
      if (!user) {
        user = new User({
          facebookId: req.user.id,
          name: req.user.displayName,
          email: req.user.emails[0].value,
        });
        await user.save();
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error) {
      console.error('Facebook Auth Error:', error.message);
      res.status(500).send('Authentication failed');
    }
  }
);

router.post('/social-login', async (req, res) => {
    const { email, name } = req.body;
  
    try {
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({ email, name });
        await user.save();
        return res.status(201).json({ isNewUser: true, user });
      }
  
      return res.status(200).json({ isNewUser: false, user });
    } catch (error) {
      console.error('Error during social login:', error.message);
      res.status(500).json({ error: 'Failed to log in with social account.' });
    }
  });

// Registration

// router.post('/register', async (req, res) => {
//     const { name, email, password, contacts } = req.body;
  
//     try {
//       // Check if the email is already registered
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ error: 'Email already registered' });
//       }
  
//       // Create a new user with contacts
//       const user = new User({ name, email, password, contacts: contacts || [] });
//       await user.save();
  
//       res.status(201).json({ message: 'User registered successfully', user });
//     } catch (error) {
//       console.error('Registration Error:', error.message);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

router.post('/register', async (req, res) => {
    console.log('Request Payload:', req.body);
    const { name, email, password, contacts } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
  
      const user = new User({
        name,
        email,
        password,
        contacts: contacts?.map(contact => ({
          phone: contact.phone,
          address: contact.address || null,
          isDefault: contact.isDefault || false,
        })) || [],
      });
  
      await user.save();
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      console.error('Registration Error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token, user });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add/Update Contacts
router.post('/:userId/contacts', async (req, res) => {
  const { userId } = req.params;
  const { phone, address, isDefault } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (isDefault) {
      user.contacts.forEach((contact) => (contact.isDefault = false));
    }
    user.contacts.push({ phone, address, isDefault });
    await user.save();
    res.status(201).json(user.contacts);
  } catch (error) {
    console.error('Error updating contacts:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
