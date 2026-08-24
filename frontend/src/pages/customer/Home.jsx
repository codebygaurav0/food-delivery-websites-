import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Home() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get("/restaurant");

      if (response.data.success) {
        setRestaurants(response.data.restaurants);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load restaurants"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) => {
      const searchText = search.toLowerCase();

      return (
        restaurant.restaurantName
          ?.toLowerCase()
          .includes(searchText) ||
        restaurant.city
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <div className="min-h-screen bg-[#FFFCF7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        @keyframes blobMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -16px) scale(1.06); }
          66% { transform: translate(-16px, 12px) scale(0.96); }
        }
        @keyframes floatSpec {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { opacity: 0.85; }
          100% { transform: translateY(-160px) rotate(45deg); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgeSizzle {
          0%, 100% { transform: rotate(-3deg) scale(1); }
          50% { transform: rotate(3deg) scale(1.04); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .fade-up { animation: fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .badge-sizzle { animation: badgeSizzle 3s ease-in-out infinite; }
        .blob { animation: blobMove 11s ease-in-out infinite; }
        .float-spec { animation: floatSpec linear infinite; }
        .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
        .r-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .r-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(217,52,37,0.12); border-color: #F0D9A8; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#F0E4D4] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="badge-sizzle text-3xl inline-block">🍔</span>
            <span
              className="text-2xl font-extrabold text-[#D93425]"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              Foodie
            </span>
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden md:block text-sm text-[#8A7461] mr-2">
                Hi,{" "}
                <span className="font-bold text-[#241608]">{user.name}</span>
              </span>
            )}

            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2 text-[#8A7461] hover:text-[#D93425] font-semibold transition-colors cursor-pointer"
            >
              📦 Orders
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="px-4 py-2 bg-gradient-to-r from-[#D93425] to-[#B32418] hover:opacity-90 active:scale-[0.97] text-white rounded-lg font-semibold transition-all shadow-md shadow-[#D93425]/20 cursor-pointer"
            >
              🛒 Cart
            </button>

            {user ? (
              <button
                onClick={logout}
                className="px-4 py-2 bg-[#FDECEA] text-[#B32418] rounded-lg font-semibold hover:bg-[#FADAD5] transition-colors cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-[#D93425] font-bold hover:text-[#B32418] transition-colors cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#D93425] via-[#C22C1F] to-[#B32418]">
        {/* Ambient blobs + drifting spice specks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="blob absolute -top-20 right-10 w-80 h-80 rounded-full bg-[#E8A93B]/20 blur-3xl" />
          <div
            className="blob absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl"
            style={{ animationDelay: "-4s" }}
          />
          {[
            { l: "8%", d: "0s", dur: "7s", e: "🌶️" },
            { l: "22%", d: "1.6s", dur: "8s", e: "✨" },
            { l: "48%", d: "0.8s", dur: "7.5s", e: "🧄" },
            { l: "68%", d: "2.4s", dur: "9s", e: "✨" },
            { l: "85%", d: "1.2s", dur: "8.5s", e: "🌿" },
          ].map((p, i) => (
            <span
              key={i}
              className="float-spec absolute bottom-0 text-xl opacity-0"
              style={{ left: p.l, animationDelay: p.d, animationDuration: p.dur }}
            >
              {p.e}
            </span>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl">
            <p className="fade-up text-white/80 font-semibold mb-3">
              Delicious food at your doorstep 🍽️
            </p>

            <h1
              className="fade-up text-4xl md:text-6xl font-extrabold text-white leading-tight"
              style={{ fontFamily: "'Baloo 2', sans-serif", animationDelay: "0.08s" }}
            >
              What are you craving today?
            </h1>

            <p className="fade-up text-white/80 text-lg mt-5" style={{ animationDelay: "0.15s" }}>
              Discover the best restaurants and order your favorite food.
            </p>

            {/* Search */}
            <div className="fade-up mt-8" style={{ animationDelay: "0.22s" }}>
              <div className="bg-white rounded-2xl shadow-xl flex items-center px-5 ring-4 ring-white/0 focus-within:ring-[#E8A93B]/40 transition-all duration-200">
                <span className="text-xl">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search restaurant or city..."
                  className="w-full px-4 py-4 outline-none text-[#241608] placeholder:text-[#B8A996]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 fade-up">
          <h2 className="text-3xl font-extrabold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Restaurants Near You
          </h2>
          <p className="text-[#8A7461] mt-1 font-medium">
            Choose a restaurant and explore its menu.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-[#FDECEA] border border-[#F3C6C0] text-[#B32418] p-4 rounded-xl fade-up font-medium">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <span className="badge-sizzle text-5xl mb-4 inline-block">🍽️</span>
            <p className="text-[#8A7461] font-medium mt-2">Loading restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#F0E4D4] p-12 text-center fade-up">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              No restaurants found
            </h3>
            <p className="text-[#8A7461] mt-2">
              Try another restaurant name or city.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, idx) => (
              <div
                key={restaurant._id}
                onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                className="r-card fade-up bg-white rounded-2xl border border-[#F0E4D4] shadow-sm overflow-hidden cursor-pointer"
                style={{ animationDelay: `${0.05 * (idx % 6)}s` }}
              >
                {/* Restaurant Image */}
                <div className="h-52 bg-gradient-to-br from-[#FDECD2] to-[#F8D9A0] flex items-center justify-center overflow-hidden">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.restaurantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-7xl">🍴</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-[#241608]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      {restaurant.restaurantName}
                    </h3>

                    <span className="flex items-center gap-1 bg-[#EFF6E9] text-[#4A7A2E] text-xs font-bold px-2 py-1 rounded-full border border-[#CFE4BE] whitespace-nowrap">
                      <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#4A7A2E]" />
                      Open
                    </span>
                  </div>

                  <p className="text-[#8A7461] mt-2">
                    📍 {restaurant.city}
                    {restaurant.state ? `, ${restaurant.state}` : ""}
                  </p>

                  {restaurant.address && (
                    <p className="text-sm text-[#B8A996] mt-2 line-clamp-1">
                      {restaurant.address}
                    </p>
                  )}

                  <button className="w-full mt-5 bg-[#FDF3E0] hover:bg-gradient-to-r hover:from-[#D93425] hover:to-[#B32418] hover:text-white text-[#B5650F] font-bold py-3 rounded-xl transition-all duration-200 cursor-pointer">
                    View Menu →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F0E4D4]">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p
            className="text-2xl font-extrabold text-[#D93425]"
            style={{ fontFamily: "'Baloo 2', sans-serif" }}
          >
            🍔 Foodie
          </p>

          <p className="text-[#8A7461] text-sm mt-2 font-medium">
            Delicious food, delivered to your door.
          </p>

          <p className="text-[#B8A996] text-xs mt-4">
            © 2026 Foodie. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;