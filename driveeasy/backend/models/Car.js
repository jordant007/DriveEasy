const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  model: { type: String, required: true },
  passengers: { type: Number, required: true },
  type: { type: String, enum: ["sedan", "hatchback"], required: true },
  rate: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }], // Array of file paths
  registration: { type: String }, // File path
  license: { type: String },     // File path
  pin: { type: String },         // File path
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Car", CarSchema);