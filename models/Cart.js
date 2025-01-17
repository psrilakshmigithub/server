const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      extras: Object, // Additional toppings or customizations
    },
  ],
  totalPrice: Number,
});

module.exports = mongoose.model('Cart', CartSchema);