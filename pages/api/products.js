import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import mongooseConnect from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  // Provera administratorskog pristupa osim za GET i POST metode
  if (method !== "GET" && method !== "POST") {
    const isAdmin = await isAdminRequest(req, res);
    if (!isAdmin) return;
  }

  try {
    if (method === "GET") {
      const { id, category } = req.query;

      if (id) {
        // Pronalazi proizvod po ID-u
        const product = await Product.findById(id).populate({
          path: "category",
          populate: { path: "parent" },
        });
        if (!product) {
          return res.status(404).json({ error: "Proizvod nije pronađen" });
        }
        return res.status(200).json({
          ...product._doc,
          lowStock: product.stock <= 2,
        });
      } else if (category) {
        // Pronalazi kategoriju po slug-u
        const categoryData = await Category.findOne({ slug: category });
        if (!categoryData) {
          return res.status(404).json({ error: "Kategorija nije pronađena" });
        }

        // Pronalazi proizvode prema kategoriji
        const products = await Product.find({ category: categoryData._id }).populate({
          path: "category",
          populate: { path: "parent" },
        });

        return res.status(200).json(
          products.map((product) => ({
            ...product._doc,
            lowStock: product.stock <= 2,
          }))
        );
      } else {
        // Vraća sve proizvode
        const products = await Product.find().populate({
          path: "category",
          populate: { path: "parent" },
        });
        return res.status(200).json(
          products.map((product) => ({
            ...product._doc,
            lowStock: product.stock <= 2,
          }))
        );
      }
    }

    if (method === "POST") {
      const { ids, title, description, price, images, category, properties, stock } = req.body;

      // Ako se šalje lista ID-ova za dohvatanje proizvoda
      if (ids && Array.isArray(ids)) {
        const products = await Product.find({ _id: { $in: ids } });
        return res.status(200).json(products);
      }

      // Kreiranje novog proizvoda
      if (!title || !price || !category) {
        return res.status(400).json({ error: "Nedostaju obavezna polja za kreiranje proizvoda" });
      }

      const productDoc = await Product.create({
        title,
        description,
        price,
        images,
        category,
        properties,
        stock,
      });

      return res.status(201).json(productDoc);
    }

    if (method === "PUT") {
      const { _id, title, description, price, images, category, properties, stock } = req.body;

      if (!_id) {
        return res.status(400).json({ error: "ID proizvoda je obavezan za ažuriranje" });
      }

      try {
        await Product.updateOne(
          { _id },
          { title, description, price, images, category: category || null, properties, stock }
        );
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Greška pri ažuriranju proizvoda:", error);
        return res.status(500).json({ error: "Greška pri ažuriranju proizvoda" });
      }
    }

    if (method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "ID proizvoda je obavezan za brisanje" });
      }

      try {
        await Product.deleteOne({ _id: id });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Greška pri brisanju proizvoda:", error);
        return res.status(500).json({ error: "Greška pri brisanju proizvoda" });
      }
    }
  } catch (error) {
    console.error(`Greška u ${method} handleru:`, error);
    return res.status(500).json({ error: "Došlo je do greške na serveru" });
  }

  // Metoda nije dozvoljena
  return res.status(405).json({ error: "Metoda nije dozvoljena" });
}
