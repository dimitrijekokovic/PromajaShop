import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import HistoryStats from "@/components/HistoryStats";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/orders?stats=true");
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError("Greška prilikom učitavanja statistike.");
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700">
            Cao, <b>{session?.user?.name}</b>
          </h2>
          <div className="flex items-center bg-gray-200 gap-3 text-black rounded-lg p-3 shadow-lg">
          <Image
            src={session?.user?.image}
            alt="User avatar"
            width={40}
            height={40}
            className="rounded-full shadow-md"
          />
            <span className="text-lg font-medium">{session?.user?.name}</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Statistika narudžbina
        </h3>
        {loading && <p className="loading">Učitavanje...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && stats && (
          <div className="stats-grid">
            <div className="stat-box">
              <h2>Danas</h2>
              <p>Broj narudžbina: {stats.dailyOrders}</p>
              <p>Ukupan iznos: {stats.dailyRevenue} RSD</p>
            </div>
            <div className="stat-box">
              <h2>Prethodna nedelja</h2>
              <p>Broj narudžbina: {stats.weeklyOrders}</p>
              <p>Ukupan iznos: {stats.weeklyRevenue} RSD</p>
            </div>
            <div className="stat-box">
              <h2>Ovaj mesec</h2>
              <p>Broj narudžbina: {stats.monthlyOrders}</p>
              <p>Ukupan iznos: {stats.monthlyRevenue} RSD</p>
            </div>
          </div>
        )}
      </div>
      <HistoryStats />
    </Layout>
  );
}
