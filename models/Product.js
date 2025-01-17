const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  details: {
    pizzas: Number, // Number of pizzas in combos or family combos
    wingsFlavors: [String], // Flavors for wings
    sides: [String], // Available sides
    drinks: [String], // Available drinks
    toppingsPerPizza: Number, // Number of free toppings per pizza
    extraToppingPrice: Number, // Price for extra toppings
    sizes: [String], // Sizes available for the item
    sizePrices: { type: Map, of: Number }, // Price adjustment for sizes
    Flavors: [String], // General flavor options for non-pizza items
  },
});

module.exports = mongoose.model('Product', productSchema);
