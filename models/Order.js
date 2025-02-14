import mongoose from 'mongoose';

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  streetAddress: { type: String, required: true },
  country: { type: String, required: true },
  products: [
    {
      name: String,
      price: Number, // Dodaj cenu proizvoda
      quantity: Number,
    },
  ],
  total: { type: Number, required: true }, // Dodaj ukupnu cenu
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
