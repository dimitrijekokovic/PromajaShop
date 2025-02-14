import jwt from "jsonwebtoken";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Token nije dostavljen." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ message: "Nevalidan ili istekao token." });
    }
  } else {
    res.status(405).json({ message: "Metod nije dozvoljen." });
  }
}
