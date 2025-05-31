import Layout from "@/components/Layout";
import clientPromise from "@/lib/mongodb";
import { useState } from "react";
import styles from "@/styles/accounts.module.css"; // Import CSS Modules

export default function AccountsPage({ users }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(users.length / itemsPerPage);

  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Lista korisnika</h1>
      <div>
        <table className={styles.accountsTable}>
          <thead>
            <tr>
              <td>Ime i prezime</td>
              <td>Email</td>
              <td>Telefon</td>
              <td>Datum registracije</td>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user._id}>
                <td data-label="Ime i prezime">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Nepoznato"}
                </td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Telefon">
                  {user.phoneNumber || "Nepoznato"}
                </td>
                <td data-label="Datum registracije">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Nepoznato"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prethodna
          </button>
          <span>
            Strana {currentPage} od {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sledeća
          </button>
        </div>
      </div>
    </Layout>
  );
}

// Serverska funkcija za povlačenje korisnika
// Serverska funkcija za povlačenje korisnika, sortirano od najnovijeg ka najstarijem
export async function getServerSideProps() {
  const client = await clientPromise;
  const db = client.db();
  const users = await db.collection("users")
    .find()
    .sort({ createdAt: -1 }) // Sortira po datumu registracije, najnoviji prvi
    .toArray();

  const usersData = users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  }));

  return {
    props: {
      users: usersData,
    },
  };
}
