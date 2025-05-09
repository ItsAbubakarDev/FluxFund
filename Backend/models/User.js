const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String }, // Changed to optional
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Removed required: false (implied)
  googleId: { type: String }, // Added for Google users
  refreshToken: { type: String } // Added for email functionality
});

module.exports = mongoose.model('User', userSchema);