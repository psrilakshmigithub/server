const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');  // Import the Passport configuration
const http = require('http'); // Required for Socket.IO
const { WebSocketServer } = require('ws');

const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/products');
const toppingsRoute = require('./routes/toppings');

const userRoutes = require('./routes/userRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware to pass the WebSocket server instance to the routes
app.use((req, res, next) => {
  req.wss = wss;

  next();
});

app.use(express.json());
app.use(session({ secret: 'your_session_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


app.use(cors());
// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


// **SSE Handling (For User)**
app.get("/sse", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).send("Missing userId");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  sseClients.set(userId, res);
  console.log(`SSE User Connected: ${userId}`);

  req.on("close", () => {
    sseClients.delete(userId);
    console.log(`❌ SSE User Disconnected: ${userId}`);
  });
});


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

app.use('/api/toppings', toppingsRoute);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);



const PORT = 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
