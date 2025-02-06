// Seed.js - Refactored to Use a Separate Toppings Model

const mongoose = require('mongoose');
const Product = require('./models/Product');
const Topping = require('./models/Topping');
const express = require('express');
const app = express();

mongoose.connect('mongodb+srv://srilakshmipasupuleti:sri123@cluster0.qilmkdx.mongodb.net/pizza_store', {
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
    price: 8.99,
    image: '/images/spicy_wings.jpg',
    details: {
      sizes: ['10 pcs','15 pcs','20 pcs' ,'25 pcs','30 pcs','35 pcs','40 pcs','45 pcs','50 pcs'],   
      sizePrices: {
        '10 pcs': 0,
        '15 pcs': 5,
        '20 pcs': 10,
        '25 pcs': 14,
        '30 pcs': 18,
        '35 pcs': 22,
        '40 pcs': 27,
        '45 pcs': 32,       
        '50 pcs': 36,  
        
      },
      wingsFlavors: ['Mild', 'Hot', 'Medium', 'Honey Garlic'],
    },
  },
  {
    name: 'Super Bowl Wings Combo Deal',
    category: 'superbowlcombo',
    price: 89.99,
    image: '/images/spicy_wings.jpg',
    details: {    
      wingsFlavors: ['Mild', 'Hot', 'Medium', 'Honey Garlic','Sweet Chili'],
      sides: ['Potato Wedges','French Fries'],   
    },
  },
  {
  name: 'Pizza & Wings Combo',
  category: 'Combos',
  price: 25.99,
  image: '/images/large_pizza_combo.jpg',
  details: {
    pizzas: 1,
    wingsFlavors: ['Mild', 'Hot', 'Medium', 'Honey Garlic','Sweet Chili'],
    sides: ['Garlic Bread','Potato Wedges','Garlic Fingers','French Fries'],
    drinks: [],
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
    image: '/images/family_combo.jpg',
    details: {
      pizzas: 2,
      wingsFlavors: ['Mild', 'Hot','Medium', 'Honey Garlic','Sweet Chili'],
      sides: ['Garlic Bread','Potato Wedges','Garlic Fingers','French Fries'],
      drinks: [],
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
    image: '/images/2for1pizza.jpg',
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
    image: '/images/3for1pizzadeal.jpg',
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
    image: '/images/panzerotti.jpg',
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
    price: 1.25,
    image: '/images/coke.jpg',
    details: {},
  },
  {
    name: 'Sprite',
    category: 'Beverages',
    price: 1.25,
    image: '/images/sprite.jpg',
    details: {},
  }, 
  {
    name: ' A&W Root Beer',
    category: 'Beverages',
    price: 1.25,
    image: '/images/aw.jpg',
    details: {},
  }, 
  {
    name: 'Pepsi',
    category: 'Beverages',
    price: 1.25,
    image: '/images/pepsi.jpg',
    details: {},
  }, 
  {
    name: 'Diet Coke',
    category: 'Beverages',
    price: 1.25,
    image: '/images/Diet-Coke-Can.jpg',
    details: {},
  }, 
  
  {
    name: 'Diet Pepsi',
    category: 'Beverages',
    price: 1.25,
    image: '/images/diet_pepsi.jpg',
    details: {},
  },

  {
    name: 'Mountain Dew',
    category: 'Beverages',
    price: 1.25,
    image: '/images/mountain dew pop.webp',
    details: {},
  },


  {
    name: 'Dr Pepper',
    category: 'Beverages',
    price: 1.25,
    image: '/images/dr-pe-pop.jpg',
    details: {},
  },

  {
    name: 'Cream Soda',
    category: 'Beverages',
    price: 1.25,
    image: '/images/crush-cream-soda-355ml.jpg',
    details: {},
  },

  {
    name: 'Orange Crush',
    category: 'Beverages',
    price: 1.25,
    image: '/images/orange-crush-pop.jpg',
    details: {},
  },

  {
    name: 'Ginger Ale',
    category: 'Beverages',
    price: 1.25,
    image: '/images/gingeralepop.jpg',
    details: {},
  },

  {
    name: 'Ginger Ale 591ml',
    category: 'Beverages',
    price: 2.49,
    image: '/images/ginger-Ale591.jpg',
    details: {},
  },{
    name: '7up 591ml',
    category: 'Beverages',
    price: 2.49,
    image: '/images/7UP591ml.jpg',
    details: {},
  },{
    name: 'Mountaindew 591ml',
    category: 'Beverages',
    price: 2.49,
    image: '/images/Mountain-Dew591.jpg',
    details: {},
  },{
    name: 'Orange Crush 591ml',
    category: 'Beverages',
    price: 2.49,
    image: '/images/Orange-Crush591.jpg',
    details: {},
  },{
    name: 'Pepsi 591 ml',
    category: 'Beverages',
    price: 2.49,
    image: '/images/Pepsi-591.jpg',
    details: {},
  },

  {
    name: 'Diet Pepsi 591 ml',
    category: 'Beverages',
    price: 2.49,
    image: '/images/Pepsi-diet591.jpg',
    details: {},
  }, 

  {
    name: 'Root Bear 591',
    category: 'Beverages',
    price: 2.49,
    image: '/images/Root-Beer591.jpg',
    details: {},
  }, 

  {
    name: 'Arizona Mango',
    category: 'Beverages',
    price: 2.99,
    image: '/images/Arizona-mango.jpg',
    details: {},
  }, 

  {
    name: 'Arizona Water melon',
    category: 'Beverages',
    price: 2.99,
    image: '/images/arizonawater.jpg',
    details: {},
  }, 

  {
    name: 'Peace Iced Tea',
    category: 'Beverages',
    price: 2.49,
    image: '/images/peace iced tea.jpg',
    details: {},
  }, 

  {
    name: 'Water Bottle',
    category: 'Beverages',
    price: 1.25,
    image: '/images/water.jpg',
    details: {},
  }, 
  {
    name: 'Chocolate milk',
    category: 'Beverages',
    price: 2.99,
    image: '/images/chocolatemilk.jpg',
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
    name: 'Sides & Dips',
    category: 'Sides',
    price: 0,
    image: '/images/sides.jpg',
    details: {}
      
    ,
  },
  {
    name: 'Potato Wedges',
    category: 'Sides',
    price: 5.99,
    image: '/images/sides.jpg',
    details: {
      
    },
  },
  {
    name: 'Garlic Bread',
    category: 'Sides',
    price: 5.99,
    image: '/images/Garlicbread.jpg',
    details: {
     
    },
  },
  {
    name: 'Garlic Fingers',
    category: 'Sides',
    price: 8.99,
    image: '/images/garlicfingers.jpg',
    details: {
      
    },
  },
  {
    name: 'French Fries',
    category: 'Sides',
    price: 5.99,
    image: '/images/Frenchfries.jpg',
    details: {
     
    },
  },
{
    name: 'Poutine Fries',
    category: 'Sides',
    price: 5.99,
    image: '/images/Poutine.jpg',
    details: {
     
    },

  },
  {
    name: 'Ranch Dip',
    category: 'Sides',
    price: 0.99,
    image: '/images/ranch.jpg',
    details: {
     
    },
  },
  {
    name: 'Creamy Garlic Dip',
    category: 'Sides',
    price: 0.99,
    image: '/images/creamygarlic.jpg',
    details: {
     
    },
  },
  {
    name: 'Cheddar',
    category: 'Sides',
    price: 0.99,
    image: '/images/cheddar.jpg',
    details: {
     
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