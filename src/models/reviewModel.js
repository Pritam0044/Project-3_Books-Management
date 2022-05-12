const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: ObjectId,
      required: "bookId is required",
      ref: "Book",
    },
    reviewedBy: {
      type: String,
      required: "reviewedBy is required",
      default: "Guest",
    },
    reviewedAt: { type: Date, required: "reviewedAt is required" },
    rating: { type: Number, required: "rating is required", minlength:1, maxlength:5 },
    review: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
