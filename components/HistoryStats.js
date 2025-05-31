import { useState } from "react";
import axios from "axios";

export default function HistoryStats() {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
  const [year, setYear] = useState(new Date().getFullYear()); // Current year
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/orders`, {
        params: { month, year },
      });
      console.log(response.data); // Check if data is correct
      setData(response.data); // Update data state
    } catch (error) {
      console.error("Error fetching history:", error);
      setData({ orders: 0, revenue: 0 }); // Handle empty or error case
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Istorija narudžbina</h3>
      <div className="flex gap-4 items-center">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded p-2"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded p-2"
          min="2000"
          max={new Date().getFullYear()}
        />
        <button
          onClick={fetchHistory}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Prikaži
        </button>
      </div>
      {loading ? (
        <p className="mt-4">Učitavanje...</p>
      ) : data ? (
        <div className="mt-4">
          <h4 className="text-md font-semibold">
            Mesec: {month}/{year}
          </h4>
          <p>Broj narudžbina: {data.orders}</p>
          <p>Ukupan iznos: {data.revenue} RSD</p>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">Nema dostupnih podataka za odabrani period.</p>
      )}
    </div>
  );
}
