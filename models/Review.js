import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

export const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
