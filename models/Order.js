const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  size: {
    type: String, // For pizzas or combos (optional for wings)
  },
  wingsFlavor: {
    type: String, // For wings or combos
  },
  sides: {
    type: [String], // For combos or family combos (e.g., Garlic Bread, Potato Wedges)
  },
  drinks: {
    type: [
      {
        name: { type: String, required: true }, // Drink name, e.g., "Sprite"
        quantity: { type: Number, required: true }, // Drink quantity, e.g., 2
      },
    ],
    default: [], // Default empty array for non-beverage orders
  },
  toppings: {
    type: mongoose.Schema.Types.Mixed, // Array for single pizza or array of arrays for family combos
    default: [],
  },
  quantity: {
    type: Number,
    required: true, // Applies to all categories
  },
  totalPrice: {
    type: Number,
    required: true, // Applies to all categories
  },
  deliveryType: {
    type: String, // 'pickup' or 'delivery'
    enum: ['pickup', 'delivery'],
  },
  contactInfo: {
    phone: { type: String, required: false },
    address: { type: String, required: false },
  },
  scheduledTime: {
    type: Date, // Date and time for scheduled orders
    required: false, // Optional field
  },
  specialInstructions: {
    type: String, // Any special instructions for the order
    required: false,
    maxlength: 500, // Limit the length of instructions
  },
  tip: {
    type: Number, // Tip amount added by the user
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
