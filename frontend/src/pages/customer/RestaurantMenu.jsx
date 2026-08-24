import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function RestaurantMenu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/restaurant/${restaurantId}/menu`
      );

      if (response.data.success) {
        setRestaurant(response.data.restaurant);
        setFoods(response.data.foods);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load restaurant menu"
      );
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (foodId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setAddingId(foodId);

      const response = await api.post("/cart/add", {
        foodId,
        quantity: 1,
      });

      if (response.data.success) {
        alert("Food added to cart successfully!");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to add food to cart"
      );
    } finally {
      setAddingId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF7]">
        <style>{`
          @keyframes dotBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
          .dot-bounce { animation: dotBounce 1.1s ease-in-out infinite; }
        `}</style>
        <div className="text-center space-y-3">
          <span className="flex gap-1.5 justify-center">
            <span className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]" style={{ animationDelay: "0s" }} />
            <span className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]" style={{ animationDelay: "0.15s" }} />
            <span className="dot-bounce w-2.5 h-2.5 rounded-full bg-[#D93425]" style={{ animationDelay: "0.3s" }} />
          </span>
          <p className="text-[#8A7461] font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes popCheck {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .fade-up { animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .dot-bounce { animation: dotBounce 1.1s ease-in-out infinite; }
        .pop-check { animation: popCheck 0.3s ease-out both; }
        .food-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .food-card:hover { transform: translateY(-4px); border-color: #F0D9A8; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#F0E4D4] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-3xl">🍔</span>
            <span
              className="text-2xl font-extrabold text-[#D93425]"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              Foodie
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-[#8A7461] font-semibold hover:text-[#241608] transition-colors cursor-pointer"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="px-4 py-2 bg-gradient-to-r from-[#D93425] to-[#B32418] text-white rounded-lg font-semibold hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-[#D93425]/20 cursor-pointer"
            >
              🛒 Cart
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Error */}
        {error && (
          <div className="mb-6 bg-[#FDECEA] border border-[#F3C6C0] text-[#B32418] p-4 rounded-xl fade-up font-medium">
            {error}
          </div>
        )}

        {/* Restaurant Header */}
        {restaurant && (
          <div className="fade-up relative overflow-hidden bg-gradient-to-r from-[#D93425] to-[#B32418] rounded-[28px] p-8 text-white mb-10 shadow-lg shadow-[#D93425]/20">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#E8A93B]/20 blur-2xl pointer-events-none" />

            <p className="text-white/70 mb-2 text-sm font-semibold uppercase tracking-wide">
              Restaurant
            </p>

            <h1 className="text-4xl font-extrabold relative z-10" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {restaurant.restaurantName}
            </h1>

            <p className="text-white/80 mt-3 relative z-10">
              📍 {restaurant.address}, {restaurant.city}, {restaurant.state}
            </p>

            <div className="mt-4 inline-flex bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-semibold relative z-10">
              ✓ Open
            </div>
          </div>
        )}

        {/* Menu Header */}
        <div className="mb-7 fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-3xl font-extrabold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Menu
          </h2>
          <p className="text-[#8A7461] mt-1 font-medium">
            Choose your favorite food.
          </p>
        </div>

        {/* Empty */}
        {foods.length === 0 ? (
          <div className="bg-white border border-[#F0E4D4] rounded-2xl p-12 text-center fade-up">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              No food available
            </h3>
            <p className="text-[#8A7461] mt-2">
              This restaurant hasn't added any food yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food, idx) => (
              <div
                key={food._id}
                className="food-card fade-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm overflow-hidden hover:shadow-xl hover:shadow-[#D93425]/5"
                style={{ animationDelay: `${0.05 * (idx % 6)}s` }}
              >
                {/* Food Image */}
                <div className="h-48 bg-gradient-to-br from-[#FDECD2] to-[#F8D9A0] flex items-center justify-center overflow-hidden">
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-7xl">🍛</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      {food.name}
                    </h3>

                    <span className="bg-[#FDF3E0] text-[#8A6412] text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap border border-[#F0DFB0]">
                      {food.category}
                    </span>
                  </div>

                  <p className="text-[#8A7461] text-sm mt-2 min-h-[40px]">
                    {food.description}
                  </p>

                  <div className="flex items-center justify-between mt-5">
                    <p className="text-2xl font-extrabold text-[#D93425]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      ₹{food.price}
                    </p>

                    <span className="pop-check text-sm text-[#4A7A2E] font-semibold flex items-center gap-1">
                      ✓ Available
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(food._id)}
                    disabled={addingId === food._id}
                    className="w-full mt-5 bg-gradient-to-r from-[#D93425] to-[#B32418] hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-[#D93425]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {addingId === food._id ? (
                      <>
                        <span className="flex gap-1">
                          <span className="dot-bounce w-1.5 h-1.5 rounded-full bg-white" style={{ animationDelay: "0s" }} />
                          <span className="dot-bounce w-1.5 h-1.5 rounded-full bg-white" style={{ animationDelay: "0.15s" }} />
                          <span className="dot-bounce w-1.5 h-1.5 rounded-full bg-white" style={{ animationDelay: "0.3s" }} />
                        </span>
                        Adding
                      </>
                    ) : (
                      "🛒 Add to Cart"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default RestaurantMenu;