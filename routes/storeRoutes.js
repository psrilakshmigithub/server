const express = require("express");
const StoreSettings = require("../models/storeSettings");

const router = express.Router();

// Get store status
router.get("/status", async (req, res) => {
  try {
    const settings = await StoreSettings.findOne();
    res.json({ storeOpen: settings ? settings.storeOpen : true });
  } catch (error) {
    res.status(500).json({ message: "Error fetching store status" });
  }
});

// Toggle store status (Admin Only)
router.post("/toggle", async (req, res) => {
  try {
    const { storeOpen } = req.body;

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }

    settings.storeOpen = storeOpen;
    await settings.save();

    res.json({ message: "Store status updated", storeOpen: settings.storeOpen });
  } catch (error) {
    res.status(500).json({ message: "Error updating store status" });
  }
});

module.exports = router;
