import mongooseConnect from "../../../lib/mongoose"; // ili connectToDatabase iz mongodb.js
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Cors from "cors";
import initMiddleware from "../../../lib/init-middleware";

// Inicijalizacija CORS
const cors = initMiddleware(
  Cors({
    methods: ["POST", "OPTIONS"], // Dozvoli POST i OPTIONS metode
  })
);

export default async function handler(req, res) {
  await cors(req, res); // Omogući CORS
  await mongooseConnect(); // Povezivanje sa bazom

  console.log("HTTP Method:", req.method); // Loguje metodu (npr. POST, OPTIONS)
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, currentPassword, newPassword } = req.body;

    // Provera da li svi potrebni parametri postoje
    if (!token || !currentPassword || !newPassword) {
      console.log("Missing fields:", { token, currentPassword, newPassword });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Dekodiraj JWT token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Koristi svoj JWT_SECRET
      userId = decoded.id; // Pretpostavka: `id` je deo tokena
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Nađi korisnika u bazi
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Proveri trenutnu lozinku
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ error: "Invalid current password" });
    }

    // Hashuj novu lozinku
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
