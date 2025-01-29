const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

// Add to Cart

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      productId,
      size,
      wingsFlavor,
      sides,
      drinks,
      toppings,
      quantity,
    } = req.body;

    console.log('Cart Payload Received:', {
      userId,
      productId,
      size,
      wingsFlavor,
      sides,
      drinks,
      toppings,
      quantity,
    });

    if (!userId || (!productId && (!drinks || drinks.length === 0))) {
      return res.status(400).json({ error: 'Missing required fields: userId, productId, or drinks.' });
    }

    let cartItems = [];

    // Case 1: Beverages are being added
    if (!productId && drinks?.length > 0) {
      console.log('Handling beverages...');

      const availableDrinks = await Product.find({ category: 'Beverages' });
      const drinkNames = availableDrinks.map((drink) => drink.name);

      // Validate the drinks
      const validDrinks = drinks.filter((drink) => drinkNames.includes(drink.name) && drink.quantity > 0);
      const invalidDrinks = drinks.filter((drink) => !drinkNames.includes(drink.name) || drink.quantity <= 0);

      if (invalidDrinks.length) {
        return res.status(400).json({
          error: `Invalid drinks selected: ${invalidDrinks.map((d) => d.name).join(', ')}`,
          allowedDrinks: drinkNames,
        });
      }

      // Prepare each drink as a separate cart item
      validDrinks.forEach((drink) => {
        const drinkDetails = availableDrinks.find((d) => d.name === drink.name);

        const totalPrice = drinkDetails.price ;
        cartItems.push({
          userId,
          productId: drinkDetails._id, // Use the product ID of the drink
          size: null,
          wingsFlavor: null,
          sides: null,
          drinks: [{ name: drink.name, quantity: drink.quantity }],
          toppings: null,
          quantity: drink.quantity,
          totalPrice,
        });
      });
    }

    // Case 2: Handling regular products, combos, or family combos
    if (productId) {
      console.log('Handling regular products...');
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      if (size && !product.details.sizes?.includes(size)) {
        return res.status(400).json({ error: `Invalid size. Allowed sizes: ${product.details.sizes?.join(', ')}` });
      }

      if (wingsFlavor && !product.details.wingsFlavors?.includes(wingsFlavor)) {
        return res.status(400).json({ error: `Invalid wings flavor. Allowed flavors: ${product.details.wingsFlavors?.join(', ')}` });
      }

      const validSides = sides?.filter((side) => product.details.sides?.includes(side)) || [];
      if (sides && validSides.length !== sides.length) {
        return res.status(400).json({ error: 'Invalid sides selected.' });
      }

      const isCombo = product.category === 'Combos' || product.category === 'FamilyCombos';
      let validDrinks = null;

      // if (isCombo) {
      //   const comboDrinkNames = product.details.drinks || [];
      //   validDrinks = drinks?.filter((drink) => comboDrinkNames.includes(drink.name)) || [];
      // }

      const sizePriceAdjustment = product.details.sizePrices?.[size] || 0;
      const extraToppingsPrice =
        Math.max(0, (toppings?.flat().length || 0) - (product.details.toppingsPerPizza || 0)) *
        (product.details.extraToppingPrice || 0);
      const totalPrice = (product.price + sizePriceAdjustment + extraToppingsPrice) * (quantity || 1);

      const mainCartItem = {
        userId,
        productId,
        size,
        wingsFlavor,
        sides: validSides,
        drinks: isCombo ? drinks : null, // Save drinks if they are part of a combo
        toppings,
        quantity: quantity || 1,
        totalPrice,
      };

      cartItems.push(mainCartItem);
    }

    if (!cartItems.length) {
      return res.status(400).json({ error: 'No valid items to add to cart.' });
    }

    // Save items to the cart
    let cart = await Cart.findOne({  userId, status: 'active'} );
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    cart.items.push(...cartItems);
    await cart.save();

    console.log('Cart items successfully added:', cartItems);
    res.status(201).json(cart);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add items to cart.' });
  }
});



router.post('/merge-cart', async (req, res) => {
  try {
    const { userId, localCart } = req.body;

    // Validate the request payload
    if (!userId || !Array.isArray(localCart) || localCart.length === 0) {
      return res.status(400).json({ error: 'Invalid request: Missing userId or localCart is empty.' });
    }

    console.log('Merging cart for user:', userId);
    console.log('Local cart items:', localCart);

    let mergedCartItems = [];

    // Retrieve the user's existing cart or create a new one
    let cart = await Cart.findOne({ userId, status: 'active'});
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Process each item from the local cart
    for (const item of localCart) {
      const {
        productId,
        size,
        wingsFlavor,
        sides,
        drinks,
        toppings,
        quantity,
      } = item;

      // Handle beverages separately
      if (!productId && drinks?.length > 0) {
        console.log('Handling beverages...');
        const availableDrinks = await Product.find({ category: 'Beverages' });
        const drinkNames = availableDrinks.map((drink) => drink.name);

        // Validate the drinks
        const validDrinks = drinks.filter((drink) => drinkNames.includes(drink.name) && drink.quantity > 0);
        const invalidDrinks = drinks.filter((drink) => !drinkNames.includes(drink.name) || drink.quantity <= 0);

        if (invalidDrinks.length) {
          console.log('Invalid drinks found:', invalidDrinks);
          continue; // Skip invalid drinks
        }

        // Prepare each drink as a separate cart item
        validDrinks.forEach((drink) => {
          const drinkDetails = availableDrinks.find((d) => d.name === drink.name);

          const totalPrice = drinkDetails.price ;

          mergedCartItems.push({
            userId,
            productId: drinkDetails._id, // Use the product ID of the drink
            size: null,
            wingsFlavor: null,
            sides: null,
            drinks: [{ name: drink.name, quantity: drink.quantity }],
            toppings: null,
            quantity: drink.quantity,
            totalPrice,
          });
        });

        continue; // Skip further processing for beverage items
      }

      // Handle regular products, combos, and family combos
      if (productId) {
        console.log('Handling regular products...');
        const product = await Product.findById(productId);
        if (!product) {
          console.error(`Product not found: ${productId}`);
          continue; // Skip invalid products
        }

        // Validate size
        if (size && !product.details.sizes?.includes(size)) {
          console.error(`Invalid size for product ${productId}: ${size}`);
          continue; // Skip invalid size
        }

        // Validate wings flavor
        if (wingsFlavor && !product.details.wingsFlavors?.includes(wingsFlavor)) {
          console.error(`Invalid wings flavor for product ${productId}: ${wingsFlavor}`);
          continue; // Skip invalid wings flavor
        }

        // Validate sides
        const validSides = sides?.filter((side) => product.details.sides?.includes(side)) || [];
        if (sides && validSides.length !== sides.length) {
          console.error(`Invalid sides for product ${productId}: ${sides}`);
          continue; // Skip invalid sides
        }

        // Calculate total price
        const sizePriceAdjustment = product.details.sizePrices?.[size] || 0;
        const extraToppingsPrice =
          Math.max(0, (toppings?.flat().length || 0) - (product.details.toppingsPerPizza || 0)) *
          (product.details.extraToppingPrice || 0);
        const totalPrice = (product.price + sizePriceAdjustment + extraToppingsPrice) * (quantity || 1);
       // const totalPrice = (product.price + sizePriceAdjustment + extraToppingsPrice) * (quantity || 1);

        // Prepare the cart item
        const cartItem = {
          userId,
          productId,
          size,
          wingsFlavor,
          sides: validSides,
          drinks: product.category === 'Combos' || product.category === 'FamilyCombos' ? drinks : null,
          toppings,
          quantity: quantity || 1,
          totalPrice,
        };

        mergedCartItems.push(cartItem);
      }
    }

    if (mergedCartItems.length === 0) {
      return res.status(400).json({ error: 'No valid items to merge into the cart.' });
    }

    // Merge the items into the user's cart
    cart.items.push(...mergedCartItems);
    await cart.save();

    console.log('Cart merged successfully:', mergedCartItems);
    res.status(201).json({ message: 'Cart merged successfully.', cart });
  } catch (error) {
    console.error('Error merging cart:', error.message);
    res.status(500).json({ error: 'Failed to merge cart.' });
  }
});





router.post('/cart/checkout', async (req, res) => {
  try {
    const { userId, paymentDetails } = req.body;

    const cart = await Cart.findOne({ userId, status: 'active' }).populate('items.orderId');
    if (!cart) {
      return res.status(404).json({ error: 'No active cart found.' });
    }

    // Process payment (use Stripe or another payment gateway)
    const paymentSuccess = await processPayment(cart.totalPrice, paymentDetails);
    if (!paymentSuccess) {
      return res.status(400).json({ error: 'Payment failed.' });
    }

    // Mark the cart as completed
    cart.status = 'completed';
    await cart.save();

    // Update the status of all orders in the cart
    await Order.updateMany(
      { _id: { $in: cart.items.map((item) => item.orderId._id) } },
      { $set: { status: 'completed' } }
    );

    res.status(200).json({ message: 'Checkout successful!', cart });
  } catch (error) {
    console.error('Error during checkout:', error.message);
    res.status(500).json({ error: 'Checkout failed.' });
  }
});


// Update item quantity in the cart
router.put('/:userId/:itemId', async (req, res) => {
  try {
    console.log("put handle change");
    const { userId, itemId } = req.params;
    const { quantity } = req.body;
    console.log("userId",userId);
    console.log("itemId",itemId);
    console.log("quantity",quantity);
    const cart = await Cart.findOne({ userId, status: 'active'});
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    console.log("cart",cart);
    const item = cart.items.id(itemId);
    console.log("item in cart",item);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    const cartItems = await Cart.findOne({ userId: req.params.userId, status: 'active' }).populate('items.productId');;
    res.json(cartItems.items || { items: [] });

    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item from the cart

router.delete('/:userId/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const cart = await Cart.findOne({ userId, status: 'active'});
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    cart.items.pull(itemId);
    await cart.save();

    const cartItems = await Cart.findOne({ userId , status: 'active'}).populate('items.productId');
    res.json(cartItems.items || { items: [] });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get cart by user ID
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId, status: 'active' }).populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart by user ID
router.get('/totalPrice/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId, status: 'active' })
    res.json(cart.totalPrice || { totalPrice: 0 }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm order
router.post('/confirm', async (req, res) => {
  try {
    const { userId, deliveryType, contactInfo, scheduledTime, instructions } = req.body;

    // Find the active cart for the user
    const cart = await Cart.findOne({ userId, status: 'active' }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ error: 'No active cart found.' });
    }

    // Update cart details
    cart.deliveryType = deliveryType;
    cart.scheduleTime = scheduledTime;
    cart.instructions = instructions;    
  

    // Save the updated cart
    await cart.save();

  

    res.status(200).json({ message: 'Order confirmed successfully!' });
  } catch (error) {
    console.error('Error confirming order:', error.message);
    res.status(500).json({ error: 'Failed to confirm order.' });
  }
});


// Update total price in the cart
router.get('/:userId/updateTotalPrice/:totalPrice', async (req, res) => {
  try {
    const { userId, totalPrice } = req.params;

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.totalPrice = totalPrice;
    await cart.save();

    res.status(200).json({ message: 'Total price updated successfully', cart });
  } catch (err) {
    console.error('Error updating total price:', err.message);
    res.status(500).json({ error: 'Failed to update total price' });
  }
});




// Add item to cart
router.post('/add', async (req, res) => {
  const { userId, productId, quantity, extras } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [], totalPrice: 0 });

    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        extras,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity + (item.extras?.toppings?.length || 0) * 1.75,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity + (item.extras?.toppings?.length || 0) * 1.75,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;