const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      size: String,
      wingsFlavor: String,
      sides: [String],
      drinks: [{ name: String, quantity: Number }],
      toppings: mongoose.Schema.Types.Mixed,
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    },
  ],
  deliveryType: { type: String, enum: ['pickup', 'delivery'], required: true },
  scheduleTime: { type: Date, required: false },
  instructions: { type: String, required: false },
  totalPrice: { type: Number, required: true },
  paymentIntentId: { type: String, required: true }, // Add this field
  status: { type: String, enum: ['pending', 'completed','payment pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);