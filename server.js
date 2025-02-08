const express = require("express");
const { WebSocketServer } = require("ws");
const server = http.createServer(app);
const HOST = process.env.HOST || '127.0.0.1'; // Default fallback
const wss = new WebSocketServer({ server, host: HOST});
require('dotenv').config();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require('bcryptjs');
const app = express();
const authRoutes = require("./routes/authRoutes");
const http = require("http");
const sseClients = new Map();
// ✅ WebSocket for Admin (Live Orders)
//const wss = new WebSocket.Server({ port: 5000 });
wss.on("connection", (ws,req) => {
  const token = req.url.split("?token=")[1];
  if (token !== process.env.ADMIN_SECRET_KEY) {
    ws.close();  // Reject unauthorized connection
    return;
}
  console.log("New admin connected");
  const pingInterval = setInterval(() => {
    ws.ping();
  }, 30000); // Ping every 30 seconds
    // Listen for pong from the client
    ws.on('pong', () => {
      console.log('Pong received from client');
    });
 
  //ws.send(JSON.stringify({ message: "Connected to Order Updates" }));

  ws.on("message", (message) => {
    console.log(`Received WebSocket message => ${message}`);
  });

  ws.on("close", () => {
    clearInterval(pingInterval);
    console.log("Admin disconnected");
  });
});


app.set("sseClients", sseClients);
app.use((req, res, next) => {
  req.wss = wss;
  req.sseClients = sseClients;
  next();
});
const categoryRoutes = require("./routes/categoryRoutes");
const itemRoutes = require("./routes/itemRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/products");
const toppingsRoute = require("./routes/toppings");
const storeRoutes = require("./routes/storeRoutes");
const userRoutes = require("./routes/userRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

app.use(express.json());
app.use(cors());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());



// ✅ SSE for Users (Order Confirmation)
app.get("/api/orders/sse", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).send("❌ Missing userId");

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Store SSE connection
  sseClients.set(userId, res);
  console.log(`✅ SSE Connected: ${userId}`);

  // Close SSE when client disconnects
  req.on("close", () => {
    sseClients.delete(userId);
    console.log(`❌ SSE Disconnected: ${userId}`);
  });
});


mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/cart", cartRoutes);
app.use("/images", express.static("public/images"));

app.use("/api/orders", orderRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/toppings", toppingsRoute);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Pizza Store API! 🚀");
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
