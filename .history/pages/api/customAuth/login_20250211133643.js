import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import Cors from "cors";

// CORS konfiguracija
const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
  origin: , // Dozvolite zahtev sa frontenda
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
  // Pokreni CORS middleware
  await runMiddleware(req, res, cors);

  // Dozvoli samo POST metode
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metod nije dozvoljen." });
  }

  const { email, password } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db();

    // Provera korisnika u bazi
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    // Validacija lozinke
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Pogrešna lozinka." });
    }

    // Generisanje JWT tokena sa korisničkim podacima
    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      },
      process.env.JWT_SECRET, // Koristi tajni ključ iz okruženja
      { expiresIn: "6h" }
    );

    // Slanje uspešnog odgovora sa tokenom
    res.status(200).json({ message: "Uspešna prijava", token });
  } catch (error) {
    console.error("Greška prilikom prijave:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}
