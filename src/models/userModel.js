const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "title required",
      enum: ["Mr", "Mrs", "Miss"]
    },
    name: { type: String, required: "name required" },
    phone: { type: String, required: "phone required", unique: true },
    email: {
      type: String,
      required: "email required",
      unique: true
    },
    password: {
      type: String,
      required: "password required",
      minLen: 8,
      maxLen: 15
    },
    address: {
      street: { type: String },
      city: { type: String },
      pincode: { type: String }
    },
    isDeleted :{type: Boolean, default:false}
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
