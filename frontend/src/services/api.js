import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";
const TOPSIS_URL = process.env.REACT_APP_TOPSIS_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const topsisApi = axios.create({
  baseURL: TOPSIS_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

const getRestaurantAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("restaurantToken")}`,
});

export const authAPI = {
  register: async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  login: async (credentials) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const data = res.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          userId: data.userId,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          avatarIcon: data.avatarIcon || "neutral",
        }));
      }

      return data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user && user !== "undefined" ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!(token && token !== "undefined" && token !== "null");
  },
};

export const userAPI = {
  getProfile: async () => {
    try {
      const res = await api.get("/users/profile");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch profile" };
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put("/users/profile", data);
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Update failed" };
    }
  },
};

export const restaurantAPI = {
  addRestaurant: async (payload) => {
    try {
      const res = await api.post("/restaurants/register", payload);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : null) ||
        error.message ||
        "Failed to add restaurant"
      );
    }
  },

  login: async (data) => {
    try {
      const res = await api.post("/restaurants/login", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Restaurant login failed");
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get("/restaurants/profile", { headers: getRestaurantAuthHeaders() });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch restaurant profile");
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put("/restaurants/profile", data, { headers: getRestaurantAuthHeaders() });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update restaurant profile");
    }
  },

  getNotifications: async () => {
    try {
      const res = await api.get("/restaurants/notifications", { headers: getRestaurantAuthHeaders() });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch notifications");
    }
  },

  getActivities: async () => {
    try {
      const res = await api.get("/restaurants/activities", { headers: getRestaurantAuthHeaders() });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch activities");
    }
  },

  confirmVisit: async (visitId) => {
    try {
      const res = await api.post(`/restaurants/activities/${visitId}/confirm`, {}, { headers: getRestaurantAuthHeaders() });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to confirm visit");
    }
  },

  requestBoost: async () => {
    try {
      const res = await api.post("/restaurants/boost/request", {}, { headers: getRestaurantAuthHeaders() });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to request boost");
    }
  },

  getPerformance: async () => {
    try {
      const res = await api.get("/restaurants/performance", { headers: getRestaurantAuthHeaders() });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch performance");
    }
  },

  getAllRestaurants: async () => {
    try {
      const res = await api.get("/restaurants/");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch restaurants" };
    }
  },

  getTags: async () => {
    try {
      const res = await api.get("/restaurants/tags");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch tags" };
    }
  },

  getSpecialties: async () => {
    try {
      const res = await api.get("/restaurants/specialties");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch specialties" };
    }
  },

  getDesserts: async () => {
    try {
      const res = await api.get("/restaurants/desserts");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch desserts" };
    }
  },

  filterRestaurants: async (data) => {
    try {
      const res = await api.post("/restaurants/filter", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to search restaurants");
    }
  },

  selectRestaurant: async (restaurantId) => {
    try {
      const res = await api.post(`/restaurants/${restaurantId}/select`, {});
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to select restaurant");
    }
  },

  rateVisit: async (restaurantId, ratingValue) => {
    try {
      const res = await api.post(`/restaurants/${restaurantId}/rate`, { ratingValue });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to rate restaurant");
    }
  },
};

export const exploreAPI = {
  getHotRestaurants: async () => {
    try {
      const res = await api.get("/explore/hot");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed" };
    }
  },
};

export const groupAPI = {
  createGroup: async (data) => {
    try {
      const res = await api.post("/groups", data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed" };
    }
  },
};

export const leaderboardAPI = {
  getLeaderboard: async () => {
    try {
      const res = await api.get("/leaderboard");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed" };
    }
  },
};

export const cfAPI = {
  getRecommendations: async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await api.get(`/recommendations/${user.userId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "CF failed" };
    }
  },
};

const API = {
  auth: authAPI,
  user: userAPI,
  restaurant: restaurantAPI,
  explore: exploreAPI,
  group: groupAPI,
  leaderboard: leaderboardAPI,
  cf: cfAPI,
  topsis: topsisApi,
};

export default API;
