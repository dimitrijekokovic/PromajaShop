import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import styles from "@/styles/orders.module.css"; // Import CSS Modules

export default function OrdersPage({ ordersData, totalOrders }) {
  const [orders, setOrders] = useState(ordersData);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  async function fetchOrders(page) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/orders?page=${page}&limit=${itemsPerPage}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      } else {
        console.error("Greška prilikom dohvaćanja narudžbina:", await res.text());
      }
    } catch (error) {
      console.error("Greška prilikom fetch funkcije:", error);
    }
  }

  function openOrderDetails(order) {
    setSelectedOrder(order);
  }

  function closeOrderDetails() {
    setSelectedOrder(null);
  }

  function handleDelete(orderId) {
    setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
  }

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <Layout>
      <h1 className="text-lg font-bold mb-4">Narudžbine</h1>
      {orders.length === 0 ? (
        <p>Nema narudžbina.</p>
      ) : (
        <>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <td>Ime</td>
                <td>Email</td>
                <td>Grad</td>
                <td>Adresa</td>
                <td>Status</td>
                <td>Datum</td>
                <td>Akcije</td>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td data-label="Ime">{order.name}</td>
                  <td data-label="Email">{order.email}</td>
                  <td data-label="Grad">{order.city}</td>
                  <td data-label="Adresa">{order.streetAddress}</td>
                  <td data-label="Status">{order.status}</td>
                  <td data-label="Datum">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label="Akcije" className={styles.ordersTableActions}>
                    <button
                      className={styles.btnDefault}
                      onClick={() => openOrderDetails(order)}
                    >
                      Detalji
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prethodna
            </button>
            <span>
              Strana {currentPage} od {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Sledeća
            </button>
          </div>
        </>
      )}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={closeOrderDetails}
        onDelete={handleDelete}
      />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { page = 1, limit = 10 } = context.query;

  try {
    const res = await fetch(
      `http://localhost:3000/api/orders?page=${page}&limit=${limit}`
    );
    if (!res.ok) {
      console.error("Greška u GET zahtevu:", await res.text());
      return { props: { ordersData: [], totalOrders: 0 } };
    }
    const { orders, total } = await res.json();
    return {
      props: {
        ordersData: orders,
        totalOrders: total,
      },
    };
  } catch (error) {
    console.error("Greška u fetch funkciji:", error);
    return {
      props: {
        ordersData: [],
        totalOrders: 0 },
    };
  }
}
