import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const initialForm = {
  restaurantName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
};

function RegisterRestaurant() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.post("/restaurant/register", formData);
      navigate("/restaurant/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit restaurant registration"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/restaurant/dashboard")}
          className="mb-6 font-semibold text-orange-500"
        >
          ← Dashboard
        </button>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Register Your Restaurant
          </h1>
          <p className="mt-2 text-gray-500">
            Submit your details for admin review. Food management opens after approval.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              ["restaurantName", "Restaurant name", "text"],
              ["email", "Restaurant email", "email"],
              ["phone", "Phone", "tel"],
              ["city", "City", "text"],
              ["state", "State", "text"],
            ].map(([name, label, type]) => (
              <label key={name} className="block text-sm font-medium text-gray-700">
                {label}
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            ))}

            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              Address
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:bg-orange-300 sm:col-span-2"
            >
              {saving ? "Submitting..." : "Submit Registration"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterRestaurant;