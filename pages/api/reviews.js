import { Review } from "@/models/Review";
import mongooseConnect from "@/lib/mongoose";
import { Product } from "@/models/Product";


export default async function handler(req, res) {
  await mongooseConnect();
  const { method, query } = req; // Ovdje pristupamo query iz req objekta.

  if (method === "GET") {
    try {
      const reviews = await Review.find(query.productId ? { product: query.productId } : {})
        .populate('product', 'title'); // Dodaje samo polje "title" proizvoda
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  }
  
  
  

  if (method === "DELETE") {
    const { id } = req.query;
    try {
      await Review.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Greška pri brisanju recenzije" });
    }
  }
  


  if (method === "POST") {
    const { productId, name, comment, rating } = req.body;
    try {
      const newReview = await Review.create({
        product: productId,
        name,
        comment,
        rating,
      });
      res.status(201).json(newReview);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  }
  
}
