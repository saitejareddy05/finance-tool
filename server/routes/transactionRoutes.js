const express = require("express");
const Transaction = require("../models/Transaction");
const router = express.Router();

// Get all transactions for a user
router.get("/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add new transaction (with duplicate check)
router.post("/", async (req, res) => {
  try {
    const { userId, type, category, amount } = req.body;

    if (!userId || !type || !category || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicates (same user, type, category, amount, same day)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const duplicate = await Transaction.findOne({
      userId,
      type,
      category,
      amount,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate transaction already exists for today" });
    }

    // Otherwise, create a new transaction
    const newTransaction = new Transaction(req.body);
    const saved = await newTransaction.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
