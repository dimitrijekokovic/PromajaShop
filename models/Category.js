import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // Dodato unique
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    properties: { type: Array, default: [] },
});

export const Category = mongoose.models?.Category || mongoose.model("Category", CategorySchema);