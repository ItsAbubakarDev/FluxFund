const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  photoUrl: { type: String }, // optional
  votes: { type: Number, default: 0 },
  tags: [{ type: String }] // 🆕 Add this line
});

module.exports = mongoose.model("Campaign", campaignSchema);
