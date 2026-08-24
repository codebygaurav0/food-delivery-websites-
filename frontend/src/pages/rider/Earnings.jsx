import { useEffect, useState } from "react";
import api from "../../services/api";

function Earnings() {
  const [earnings, setEarnings] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await api.get(
          "/order/rider/earnings"
        );

        setEarnings(
          response.data?.earnings || {
            totalDeliveries: 0,
            totalEarnings: 0,
          }
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load earnings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading earnings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">
          Rider Earnings
        </h1>

        <p className="text-gray-500 mt-1 mb-8">
          Track your completed deliveries and earnings.
        </p>

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-7 border shadow-sm">
            <p className="text-gray-500">
              Total Deliveries
            </p>

            <p className="text-4xl font-bold text-blue-600 mt-3">
              {earnings.totalDeliveries}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border shadow-sm">
            <p className="text-gray-500">
              Total Earnings
            </p>

            <p className="text-4xl font-bold text-green-600 mt-3">
              {money(earnings.totalEarnings)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Earnings;