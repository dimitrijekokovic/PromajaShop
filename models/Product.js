import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Ref na kategoriju
    properties: { type: Object },
    stock: { type: Number, default: 0 },
  }, { timestamps: true });
  
  export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
  