const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/:id/wallet
router.patch('/users/:id/wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, { walletAddress }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Wallet linked', user });
  } catch (err) {
    console.error("[WALLET LINK ERROR]", err);
    res.status(500).json({ error: 'Failed to link wallet' });
  }
});

module.exports = router;
