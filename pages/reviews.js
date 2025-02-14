import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "@/styles/reviews.module.css"; // Import CSS Modules

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const { data } = await axios.get("/api/reviews");
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  async function deleteReview(reviewId) {
    if (confirm("Da li ste sigurni da želite da obrišete ovu recenziju?")) {
      try {
        await axios.delete(`/api/reviews?id=${reviewId}`);
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  }

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const paginatedReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div>
        <h1 className="text-xl font-bold mb-4">Recenzije</h1>
        <table className={styles.reviewsTable}>
          <thead>
            <tr>
              <td>Korisnik</td>
              <td>Ocena</td>
              <td>Komentar</td>
              <td>Proizvod</td>
              <td>Akcije</td>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <tr key={review._id}>
                  <td data-label="Korisnik">{review.name}</td>
                  <td data-label="Ocena">{review.rating} zvezdica</td>
                  <td data-label="Komentar">{review.comment}</td>
                  <td data-label="Proizvod">{review.product?.title || "Nepoznat proizvod"}</td>
                  <td data-label="Akcije" className={styles.reviewsTableActions}>
                    <button
                      onClick={() => deleteReview(review._id)}
                      className={styles.btnRed}
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500">
                  Nema dostupnih recenzija.
                </td>
              </tr>
            )}
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
      </div>
    </Layout>
  );
}
