// Seed.js - Refactored to Use a Separate Toppings Model

const mongoose = require('mongoose');
const Product = require('./models/Product');
const Topping = require('./models/Topping');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost:27017/pizza_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

// Middleware for JSON parsing
app.use(express.json());

// Toppings Data
const toppings = [
  'Anchovies',
  'Bacon',
  'Beef',
  'Black Olives',
  'Broccoli',
  'Chicken',
  'Feta Cheese',
  'Green Peppers',
  'Ham',
  'Hot Peppers',
  'Hot Sausage',
  'Italian Sausage',
  'Mushroom',
  'Onions',
  'Pepperoni',
  'Pineapple',
  'Salami',
  'Sliced Tomatoes',
  'Sun-Dried Tomatoes',
];

// Products Data
const products = [
  // Wings
  {
    name: 'Wings',
    category: 'Wings',
    price: 23.99,
    image: '/images/mild_wings.jpg',
    details: {
      sizes: ['10 pcs', '25 pcs', '50 pcs'],
      Flavors: ['Mild', 'Hot', 'Medium', 'Honey Garlic'],
    },
  },
  
  {
  name: 'Pizza & Wings Combo',
  category: 'Combos',
  price: 25.99,
  image: '/images/medium_combo.jpg',
  details: {
    pizzas: 1,
    wingsFlavors: ['Mild', 'Hot', 'Medium', 'Honey Garlic'],
    sides: ['Garlic Bread', 'Potato Wedges'],
    drinks: ['Sprite', 'Root Beer'],
    toppingsPerPizza: 3,
    extraToppingPrice: 1.75,
    sizes: ['Small', 'Medium', 'Large','ExtraLarge'],
    sizePrices: {
      Small: 0,
      Medium: 5,
      Large: 10,
      ExtraLarge: 15
    },
    beverages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Beverage',
      },
    ]
  },
},
 
  {
    name: 'Two Pizzas Family Combo',
    category: 'FamilyCombos',
    price: 39.99,
    image: '/images/medium_combo.jpg',
    details: {
      pizzas: 2,
      wingsFlavors: ['Mild', 'Hot','Medium', 'Honey Garlic'],
      sides: ['Garlic Bread','Potato Wedges'],
      drinks: ['Sprite', 'Root Beer'],
      toppingsPerPizza: 3,
      extraToppingPrice: 1.75,
      sizes: ['Small', 'Medium', 'Large','ExtraLarge'],
      sizePrices: {
        Small: 0,
        Medium: 5,
        Large: 10,
        ExtraLarge: 15
      },
      beverages: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Beverage',
        },
      ]
    },
  },
  

  // Two-for-One Deals
  {
    name: 'Two for One Pizza Deal',
    category: 'TwoforOneDeals',
    price: 29.99,
    image: '/images/two_for_one.jpg',
    details: {
      pizzas: 2,
      toppingsPerPizza: 3,
      extraToppingPrice: 1.75,
      sizes: ['Small', 'Medium', 'Large','ExtraLarge'],
      sizePrices: {
        Small: 0,
        Medium: 5,
        Large: 10,
        ExtraLarge: 15
      },
    },
  },

  // Three-for-One Deals
  {
    name: 'Three for One Pizza Deal',
    category: 'ThreeforOneDeals',
    price: 39.99,
    image: '/images/three_for_one.jpg',
    details: {
      pizzas: 3,
      toppingsPerPizza: 3,
      extraToppingPrice: 1.75,
      sizes: ['Small', 'Medium', 'Large','ExtraLarge'],
      sizePrices: {
        Small: 0,
        Medium: 5,
        Large: 10,
        ExtraLarge: 15
      },
    },
  },

  // Panzerotte
  {
    name: 'Panzerotte',
    category: 'Panzerotte',
    price: 13.99,
    image: '/images/cheese_panzerotte.jpg',
    details: {      
      Flavors: ['Cheese', 'Classic'],
      toppingsPerPizza: 3,
      extraToppingPrice: 1.75,
    },
  },

  // Beverages
  {
    name: 'Coke',
    category: 'Beverages',
    price: 1.99,
    image: '/images/coke.jpg',
    details: {},
  },
  {
    name: 'Sprite',
    category: 'Beverages',
    price: 1.99,
    image: '/images/sprite.jpg',
    details: {},
  }, 
  {
    name: 'Root Beer',
    category: 'Beverages',
    price: 1.99,
    image: '/images/sprite.jpg',
    details: {},
  }, 
  {
    name: 'Pepsi',
    category: 'Beverages',
    price: 1.99,
    image: '/images/sprite.jpg',
    details: {},
  }, 
  {
    name: 'Diet Coke',
    category: 'Beverages',
    price: 1.99,
    image: '/images/sprite.jpg',
    details: {},
  }, 
  {
    name: 'Diet Pepsi',
    category: 'Beverages',
    price: 1.99,
    image: '/images/sprite.jpg',
    details: {},
  }, 
  
    {
      name: 'Beverages',
      category: 'Beverages',
      price: 0, // Price is dynamically calculated
      image: '/images/beverages.jpg',
      details: {}, // No specific details needed
    },
  
  {
    name: 'Sides',
    category: 'Sides',
    price: 4.99,
    image: '/images/potato_wedges.jpg',
    details: {
      Flavors: ['Garlic Bread', 'Potato Wedges'],
    },
  },

  
];

const seedDatabase = async () => {
    try {
      await Topping.deleteMany();
      await Product.deleteMany();
  
      const toppingDocs = toppings.map((name) => ({ name }));
      await Topping.insertMany(toppingDocs);
      await Product.insertMany(products);
  
      console.log('Database seeded successfully!');
      mongoose.connection.close();
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  };
  

  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
  seedDatabase();