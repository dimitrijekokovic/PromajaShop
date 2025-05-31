import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import Cors from "cors";

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
  origin: '*',
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method === "POST") {
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db();

      // Proveri da li korisnik već postoji
      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Korisnik sa ovim emailom već postoji." });
      }

      // Hashuj lozinku
      const hashedPassword = await bcrypt.hash(password, 10);

      // Kreiraj korisnika u bazi
      const newUser = {
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      };
      await db.collection("users").insertOne(newUser);

      // Kreiraj JWT token
      const token = jwt.sign(
        {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phoneNumber: newUser.phoneNumber,
        },
        process.env.JWT_SECRET,
        { expiresIn: "6h" }
      );

      res.status(201).json({ message: "Registracija uspešna.", token });
    } catch (error) {
      console.error("Greška na serveru:", error);
      res.status(500).json({ message: "Greška na serveru." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Metod ${req.method} nije dozvoljen.` });
  }
}
