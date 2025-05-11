const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  walletAddress: {
    type: String,
    validate: {
      validator: v => !v || /^0x[a-fA-F0-9]{40}$/.test(v),
      message: "Invalid Ethereum address"
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
