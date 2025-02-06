const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    address: { type: String, required: false },
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      size: String,
      wingsFlavor: String,
      sides: [String],
      drinks: [{ name: String, quantity: Number }],
      toppings: mongoose.Schema.Types.Mixed,
      priceByQuantity: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      description: { type: String, required: false },
    },
  ],
  deliveryType: { type: String, enum: ['pickup', 'delivery'], required: true },
  scheduleTime: { type: Date, required: false },
  instructions: { type: String, required: false },
  totalPrice: { type: Number, required: true },
  tip: { type: Number,  default: 0 },
  paymentIntentId: { type: String, required: false }, // Add this field
  status: { type: String, enum: ['pending', 'completed','payment pending','confirmed','accepted','declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['paid','not paid','refunded'], default: 'not paid' }, // Add this field
  isOrderConfirmed: { type: Boolean, default: false }, // Add this field
  reason: { type: String, required: false }, // Add this field
  deliveryFee: { type: Number, required: false, default: 0 },

});

module.exports = mongoose.model('Order', orderSchema);