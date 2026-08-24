import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Foods() {
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Starter",
    image: "",
    isAvailable: true,
  });

  // ================= FETCH FOODS =================
  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setError("");

      const response = await api.get("/food/my-foods");

      if (response.data.success) {
        setFoods(response.data.foods || []);
      }
    } catch (error) {
      console.error("Fetch Foods Error:", error);

      console.log(
        "Status:",
        error.response?.status
      );

      console.log(
        "Backend Response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          `Unable to load foods. Status: ${
            error.response?.status || "Unknown"
          }`
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Starter",
      image: "",
      isAvailable: true,
    });

    setEditingId(null);
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        image: formData.image.trim(),
        isAvailable: formData.isAvailable,
      };

      let response;

      if (editingId) {
        response = await api.put(
          `/food/${editingId}`,
          payload
        );
      } else {
        response = await api.post(
          "/food/add",
          payload
        );
      }

      if (response.data.success) {
        resetForm();

        await fetchFoods();
      }
    } catch (error) {
      console.error("Save Food Error:", error);

      console.log(
        "Status:",
        error.response?.status
      );

      console.log(
        "Backend Response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          `Unable to save food. Status: ${
            error.response?.status || "Unknown"
          }`
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= EDIT =================
  const editFood = (food) => {
    setEditingId(food._id);

    setFormData({
      name: food.name || "",
      description: food.description || "",
      price: food.price || "",
      category: food.category || "Starter",
      image: food.image || "",
      isAvailable:
        food.isAvailable !== false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= DELETE =================
  const deleteFood = async (foodId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this food?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      const response = await api.delete(
        `/food/${foodId}`
      );

      if (response.data.success) {
        setFoods((prev) =>
          prev.filter(
            (food) => food._id !== foodId
          )
        );
      }
    } catch (error) {
      console.error("Delete Food Error:", error);

      setError(
        error.response?.data?.message ||
          `Unable to delete food. Status: ${
            error.response?.status || "Unknown"
          }`
      );
    }
  };

  // ================= AVAILABILITY =================
  const toggleAvailability = async (food) => {
    try {
      setError("");

      const response = await api.put(
        `/food/${food._id}`,
        {
          isAvailable:
            !food.isAvailable,
        }
      );

      if (response.data.success) {
        setFoods((prev) =>
          prev.map((item) =>
            item._id === food._id
              ? response.data.food
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "Availability Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          `Unable to update food. Status: ${
            error.response?.status || "Unknown"
          }`
      );
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="text-6xl mb-4">
            🍽️
          </div>

          <p className="text-gray-500">
            Loading menu...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= NAVBAR ================= */}
      <nav className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <button
            onClick={() =>
              navigate(
                "/restaurant/dashboard"
              )
            }
            className="text-orange-500 font-semibold hover:text-orange-600"
          >
            ← Dashboard
          </button>

          <h1 className="text-2xl font-bold text-orange-500">
            🍽️ Menu Management
          </h1>

          <button
            onClick={() =>
              navigate(
                "/restaurant/orders"
              )
            }
            className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100"
          >
            📦 Orders
          </button>

        </div>

      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* ================= HEADER ================= */}
        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            Manage Your Menu
          </h2>

          <p className="text-gray-500 mt-1">
            Add, edit and manage your
            restaurant food items.
          </p>

        </div>

        {/* ================= ERROR ================= */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="font-semibold">
                  Error
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>

              </div>

              <button
                onClick={() =>
                  setError("")
                }
                className="font-bold text-lg"
              >
                ×
              </button>

            </div>

          </div>
        )}

        {/* ================= FORM ================= */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h3 className="text-xl font-bold text-gray-900">
                {editingId
                  ? "Edit Food"
                  : "Add New Food"}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Enter food item details below.
              </p>

            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            {/* Name */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Paneer Tikka Special"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* Price */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 250"
                min="1"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* Category */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >

                <option value="Starter">
                  Starter
                </option>

                <option value="Main Course">
                  Main Course
                </option>

                <option value="Pizza">
                  Pizza
                </option>

                <option value="Burger">
                  Burger
                </option>

                <option value="Beverage">
                  Beverage
                </option>

                <option value="Dessert">
                  Dessert
                </option>

              </select>

            </div>

            {/* Image */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>

              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* Description */}
            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your food..."
                rows="3"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* Available */}
            <div className="md:col-span-2">

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={
                    formData.isAvailable
                  }
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span className="font-medium text-gray-700">
                  Food is available
                </span>

              </label>

            </div>

            {/* Button */}
            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-8 py-3 rounded-xl shadow-md"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Food"
                  : "Add Food"}
              </button>

            </div>

          </form>

        </div>

        {/* ================= MENU ================= */}
        <div>

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="text-2xl font-bold text-gray-900">
                Your Menu
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                {foods.length} food item
                {foods.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

          </div>

          {foods.length === 0 ? (

            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

              <div className="text-6xl mb-4">
                🍽️
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                No Food Items
              </h3>

              <p className="text-gray-500 mt-2">
                Add your first food item
                above.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {foods.map((food) => (

                <div
                  key={food._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >

                  <div className="h-48 bg-orange-100 flex items-center justify-center">

                    {food.image ? (

                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <span className="text-7xl">
                        🍛
                      </span>

                    )}

                  </div>

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <h4 className="text-xl font-bold text-gray-900">
                        {food.name}
                      </h4>

                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                          food.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {food.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>

                    </div>

                    <p className="text-orange-500 font-bold text-2xl mt-3">
                      ₹{food.price}
                    </p>

                    <span className="inline-block mt-2 bg-orange-50 text-orange-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {food.category}
                    </span>

                    <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                      {food.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <button
                        onClick={() =>
                          editFood(food)
                        }
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold py-2.5 rounded-xl"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteFood(
                            food._id
                          )
                        }
                        className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2.5 rounded-xl"
                      >
                        🗑️ Delete
                      </button>

                    </div>

                    <button
                      onClick={() =>
                        toggleAvailability(
                          food
                        )
                      }
                      className={`w-full mt-3 font-semibold py-2.5 rounded-xl ${
                        food.isAvailable
                          ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {food.isAvailable
                        ? "⏸ Mark Unavailable"
                        : "✓ Mark Available"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default Foods;