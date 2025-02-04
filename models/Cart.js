const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      size: String, // For wings and combos
      wingsFlavor: String, // For wings
      sides: [String], // For combos or family combos
      drinks: [{ name: String, quantity: Number }], // For beverages
      toppings: mongoose.Schema.Types.Mixed, // Array for single pizza or nested arrays for family combos
      quantity: { type: Number, required: true },
      priceByQuantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    },
  ],
  deliveryType: { type: String, enum: ['pickup', 'delivery'], required: true,default: 'pickup' },
  scheduleTime: { type: Date, required: false },
  instructions: { type: String, required: false },
  totalPrice: { type: Number, required: false },
  tip: { type: Number, required: false, default: 0 },
  status: { type: String, enum: ['active', 'completed','confirmed','pending','payment pending'], default: 'active' }, // Optional
  createdAt: { type: Date, default: Date.now },
});

// Indexing for faster lookups
cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);

