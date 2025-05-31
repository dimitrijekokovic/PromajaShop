import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb"; // Putanja ka tvojoj MongoDB konekciji

// Lista admin email adresa
const adminEmails = ["dimitrije.kokovic@gmail.com", "lazarbatas@gmail.com"];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise), // MongoDB adapter za NextAuth
  callbacks: {
    // Callback za sesiju
    async session({ session, user }) {
      // Dodavanje uloge korisniku na osnovu email adrese
      if (adminEmails.includes(session?.user?.email)) {
        session.user.role = "admin";
      } else {
        session.user.role = "user";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirekcija nakon prijave ili odjave
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login", // Putanja za stranicu za prijavu
    signOut: "/", // Putanja za odjavu (možeš je promeniti po potrebi)
    error: "/auth/error", // Putanja za greške (opciono)
  },
  secret: process.env.NEXTAUTH_SECRET, // Mora biti ista kao u .env fajlu
};

export default NextAuth(authOptions);

// Helper funkcija za proveru da li je admin
export async function isAdminRequest(req, res) {
  try {
    const { getServerSession } = require("next-auth");
    const session = await getServerSession(req, res, authOptions);

    if (!session || !adminEmails.includes(session?.user?.email)) {
      res.status(403).json({ error: "Pristup odbijen. Niste admin." });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Greška u isAdminRequest funkciji:", error);
    res.status(500).json({ error: "Internal server error" });
    return false;
  }
}
