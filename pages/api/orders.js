import Cors from "cors";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Order from "@/models/Order";

const cors = Cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "DELETE"],
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

  const client = await clientPromise;
  const db = client.db();

  if (req.method === "GET") {
    const { email, stats, page = 1, limit = 10, month, year } = req.query;

    if (stats === "true") {
      try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const ordersToday = await db.collection("orders").find({
          createdAt: { $gte: startOfToday },
        }).toArray();

        const ordersWeek = await db.collection("orders").find({
          createdAt: { $gte: startOfWeek },
        }).toArray();

        const ordersMonth = await db.collection("orders").find({
          createdAt: { $gte: startOfMonth },
        }).toArray();

        const stats = {
          dailyOrders: ordersToday.length,
          dailyRevenue: ordersToday.reduce((sum, order) => sum + order.total, 0),
          weeklyOrders: ordersWeek.length,
          weeklyRevenue: ordersWeek.reduce((sum, order) => sum + order.total, 0),
          monthlyOrders: ordersMonth.length,
          monthlyRevenue: ordersMonth.reduce((sum, order) => sum + order.total, 0),
        };

        return res.status(200).json(stats);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        return res.status(500).json({ message: "Error fetching statistics" });
      }
    }

    if (month && year) {
      try {
          const startOfMonth = new Date(year, month - 1, 1);
          const endOfMonth = new Date(year, month, 0);
          const ordersInMonth = await db.collection("orders").find({
              createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          }).toArray();
  
          const totalRevenue = ordersInMonth.reduce((sum, order) => sum + (order.total || 0), 0);
  
          return res.status(200).json({
              orders: ordersInMonth.length,
              revenue: totalRevenue,
          });
      } catch (error) {
          console.error("Error fetching monthly orders:", error);
          return res.status(500).json({ message: "Error fetching monthly orders" });
      }
  }
  

    try {
      const skip = (page - 1) * limit;
      const filter = email ? { email } : {};

      const total = await db.collection("orders").countDocuments(filter);
      const orders = await db
        .collection("orders")
        .find(filter)
        .sort({ createdAt: -1 }) // Sort from newest to oldest
        .skip(Number(skip))
        .limit(Number(limit))
        .toArray();

      return res.status(200).json({ orders, total });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ message: "Error fetching orders" });
    }
  } else if (req.method === "POST") {
    try {
      const {
        name,
        email,
        phoneNumber,
        city,
        postalCode,
        streetAddress,
        country,
        cartProducts,
      } = req.body;

      if (!name || !email || !phoneNumber || !cartProducts?.length) {
        return res.status(400).json({ success: false, message: "Invalid data" });
      }

      const detailedProducts = await Promise.all(
        cartProducts.map(async (prod) => {
          try {
            const productData = await db.collection("products").findOne({
              _id: new ObjectId(prod.productId),
            });
      
            if (!productData) {
              throw new Error(`Product with ID ${prod.productId} not found.`);
            }
      
            // Ako nema dovoljno na stanju, ne smanjujemo zalihe, ali čuvamo ime proizvoda
            if (productData.stock < prod.quantity) {
              console.warn(
                `Warning: Not enough stock for product ${productData.title}, ordered: ${prod.quantity}, available: ${productData.stock}`
              );
      
              return {
                productId: prod.productId,
                quantity: prod.quantity,
                name: productData.title, // Uvek čuvamo pravo ime
                price: productData.price,
              };
            }
      
            // Smanjujemo zalihe samo ako ih ima dovoljno
            await db.collection("products").updateOne(
              { _id: new ObjectId(prod.productId) },
              { $inc: { stock: -prod.quantity } }
            );
      
            return {
              productId: prod.productId,
              quantity: prod.quantity,
              name: productData.title, // Uvek čuvamo pravo ime
              price: productData.price,
            };
          } catch (error) {
            console.error(error.message);
            return {
              productId: prod.productId,
              quantity: prod.quantity,
              name: "Nepoznat proizvod", // Ipak dodajemo nešto umesto "Unknown product"
              price: 0,
            };
          }
        })
      );
      
      

      const totalPrice = detailedProducts.reduce(
        (acc, prod) => acc + prod.quantity * prod.price,
        0
      );

      const newOrder = await db.collection("orders").insertOne({
        name,
        email,
        phoneNumber,
        city,
        postalCode,
        streetAddress,
        country,
        products: detailedProducts,
        total: totalPrice,
        status: "pending",
        createdAt: new Date(),
      });

      return res.status(201).json({ success: true, orderId: newOrder.insertedId });
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    try {
      await db.collection("orders").deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ message: "Order successfully deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting order" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
