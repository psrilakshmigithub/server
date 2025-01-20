const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');  // Import the Passport configuration

const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/products');
const toppingsRoute = require('./routes/toppings');
const beveragesRoutes = require('./routes/beverageRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const app = express();

app.use(express.json());
app.use(session({ secret: 'your_session_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


app.use(cors());

mongoose.connect('mongodb+srv://srilakshmipasupuleti:sri123@cluster0.qilmkdx.mongodb.net/pizza_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/images', express.static('public/images'));

app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/beverages', beveragesRoutes);
app.use('/api/toppings', toppingsRoute);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
