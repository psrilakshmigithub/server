const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Add a new contact

router.post('/:userId/contacts', async (req, res) => {
    try {

      const { userId } = req.params;
      const { phone, address, isDefault } = req.body;
            console.log('Request Payload:', req.body);
      if (!address.toLowerCase().includes('guelph')) {
        return res.status(400).json({ error: 'Delivery address must be within Guelph.' });
      }
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });
  
      if (isDefault) {
        user.contacts.forEach((contact) => (contact.isDefault = false));
      }
  
      user.contacts.push({ phone, address, isDefault });
      await user.save();
  
      res.status(201).json(user.contacts);
    } catch (error) {
      console.error('Error adding contact:', error);
      res.status(500).json({ error: 'Failed to add contact.' });
    }
  });
  

// Get all contacts
router.get('/:userId/contacts', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.status(200).json(user.contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});


// Update the default contact's phone number
// PUT route to update default contact's phone number
router.put('/:userId/contacts/default/:phone', async (req, res) => {
  try {
    const { userId, phone } = req.params; // Get userId and phone from URL params

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check if the user has a default contact
    let defaultContact = user.contacts.find((contact) => contact.isDefault);

    // If no default contact exists, create one
    if (!defaultContact) {
      defaultContact = { phone, isDefault: true };
      user.contacts.push(defaultContact); // Add the new default contact to the user's contacts
    } else {
      // If default contact exists, update the phone number
      defaultContact.phone = phone;
    }

    // Save the updated user data
    await user.save();

    res.status(200).json(defaultContact); // Return the updated default contact
  } catch (error) {
    console.error('Error updating default contact phone:', error.message);
    res.status(500).json({ error: 'Failed to update default contact phone.' });
  }
});





// Update a contact
router.put('/:userId/contacts/:contactId', async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    const { phone, address, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const contact = user.contacts.id(contactId);
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });

    if (phone) contact.phone = phone;
    if (address) contact.address = address;

    // If the updated contact is marked as default, unset existing default
    if (isDefault) {
      user.contacts.forEach((c) => (c.isDefault = false));
      contact.isDefault = true;
    }

    await user.save();
    res.status(200).json(user.contacts);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact.' });
  }
});


// Delete a contact
router.delete('/:userId/contacts/:contactId', async (req, res) => {
    try {
      const { userId, contactId } = req.params;
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });
  
      // Remove the contact by ID using Mongoose's pull
      const contactIndex = user.contacts.findIndex((c) => c._id.toString() === contactId);
      if (contactIndex === -1) return res.status(404).json({ error: 'Contact not found.' });
  
      user.contacts.splice(contactIndex, 1); // Remove the contact
      await user.save();
  
      res.status(200).json(user.contacts);
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ error: 'Failed to delete contact.' });
    }
  });
  // Fetch default contact
router.get('/:userId/default-contact', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });
  
      const defaultContact = user.contacts.find((contact) => contact.isDefault);
      res.status(200).json(defaultContact || {});
    } catch (error) {
      console.error('Error fetching default contact:', error.message);
      res.status(500).json({ error: 'Failed to fetch default contact.' });
    }
  });
  
  // Save new default contact
  router.post('/:userId/contacts/default', async (req, res) => {
    try {
      const { userId } = req.params;
      const { phone, address } = req.body;
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });
  
      // Set all existing contacts to non-default
      user.contacts.forEach((contact) => (contact.isDefault = false));
  
      // Add or update the default contact
      const newContact = { phone, address, isDefault: true };
      user.contacts.push(newContact);
  
      await user.save();
      res.status(201).json(newContact);
    } catch (error) {
      console.error('Error saving default contact:', error.message);
      res.status(500).json({ error: 'Failed to save default contact.' });
    }
  });

module.exports = router;
