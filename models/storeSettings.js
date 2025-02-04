const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema({
  storeOpen: { type: Boolean, default: true }, // Store status flag
});

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);