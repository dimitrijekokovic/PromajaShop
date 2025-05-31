import { Category } from "@/models/Category";
import mongooseConnect from "@/lib/mongoose";

export default async function handle(req, res) {
  await mongooseConnect();
  const { method } = req;

  if (method === "GET") {
    try {
      // Fetch all categories with parent populated
      const categories = await Category.find().populate("parent");
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Greška pri učitavanju kategorija" });
    }
  }

  if (method === "POST") {
    const { name, parentCategory, properties } = req.body;

    // Automatski generišemo slug iz naziva kategorije
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
        const newCategory = await Category.create({
            name,
            slug, // Dodajemo generisani slug
            parent: parentCategory || null,
            properties,
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Greška pri kreiranju kategorije:", error);
        res.status(500).json({ error: "Greška pri kreiranju kategorije" });
    }
}



  if (method === "PUT") {
    const { _id, name, parentCategory, properties } = req.body;
    try {
      await Category.updateOne(
        { _id },
        { name, parent: parentCategory || null, properties }
      );
      res.json(true);
    } catch (error) {
      res.status(500).json({ error: "Greška pri ažuriranju kategorije" });
    }
  }

  if (method === "DELETE") {
    const { _id } = req.body;
    try {
      await Category.deleteOne({ _id });
      res.json(true);
    } catch (error) {
      res.status(500).json({ error: "Greška pri brisanju kategorije" });
    }
  }
}
