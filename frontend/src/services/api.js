import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://food-delivery-websites-wo3m.onrender.com",

  headers: {
    "Content-Type": "application/json",
  },
});

// ================= AUTH TOKEN =================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      `${config.baseURL}${config.url}`
    );

    console.log("Token exists:", Boolean(token));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE ERROR =================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data
    );

    return Promise.reject(error);
  }
);

export default api;