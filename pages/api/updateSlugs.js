import mongooseConnect from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  const isAdmin = await isAdminRequest(req, res);
  if (!isAdmin) return;

  try {
    const categories = await Category.find();
    for (const category of categories) {
      if (!category.slug) {
        category.slug = category.name.toLowerCase().replace(/\s+/g, "-");
        await category.save();
      }
    }
    res.status(200).json({ message: "Slugs updated successfully" });
  } catch (error) {
    console.error("Error updating slugs:", error);
    res.status(500).json({ error: "Error updating slugs" });
  }
}
