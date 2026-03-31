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
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.userId,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            avatarIcon: data.avatarIcon || "neutral",
          })
        );
      }

      return data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  checkUsername: async (username) => {
    try {
      const response = await api.get(`/auth/check-username/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Username check failed" };
    }
  },

  checkEmail: async (email) => {
    try {
      const response = await api.get(`/auth/check-email/${email}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Email check failed" };
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
      const response = await api.get("/users/profile");
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch profile" };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData);
      const updatedUser = response.data;
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return updatedUser;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update profile" };
    }
  },

  requestDeletion: async () => {
    try {
      const response = await api.post("/users/deletion-request");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to request deletion" };
    }
  },

  getVisitHistory: async () => {
    try {
      const response = await api.get("/users/visits");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch visit history" };
    }
  },
};

export const restaurantAPI = {
  addRestaurant: async (payload) => {
    try {
      const response = await api.post("/restaurants/register", payload);
      return response.data;
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
      const response = await api.post("/restaurants/login", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Restaurant login failed");
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get("/restaurants/profile", { headers: getRestaurantAuthHeaders() });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch restaurant profile");
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put("/restaurants/profile", data, { headers: getRestaurantAuthHeaders() });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update restaurant profile");
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get("/restaurants/notifications", { headers: getRestaurantAuthHeaders() });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch notifications");
    }
  },

  getActivities: async () => {
    try {
      const response = await api.get("/restaurants/activities", { headers: getRestaurantAuthHeaders() });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch activities");
    }
  },

  confirmVisit: async (visitId) => {
    try {
      const response = await api.post(`/restaurants/activities/${visitId}/confirm`, {}, { headers: getRestaurantAuthHeaders() });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to confirm visit");
    }
  },

  requestBoost: async () => {
    try {
      const response = await api.post("/restaurants/boost/request", {}, { headers: getRestaurantAuthHeaders() });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to request boost");
    }
  },

  getPerformance: async () => {
    try {
      const response = await api.get("/restaurants/performance", { headers: getRestaurantAuthHeaders() });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch performance");
    }
  },

  getAllRestaurants: async () => {
    try {
      const response = await api.get("/restaurants");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch restaurants" };
    }
  },

  getTopWeeklyRestaurants: async () => {
    try {
      const response = await api.get("/restaurants/top-weekly");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch top weekly restaurants" };
    }
  },

  getTags: async () => {
    try {
      const response = await api.get("/restaurants/tags");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch tags" };
    }
  },

  getSpecialties: async () => {
    try {
      const response = await api.get("/restaurants/specialties");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch specialties" };
    }
  },

  getDesserts: async () => {
    try {
      const response = await api.get("/restaurants/desserts");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch desserts" };
    }
  },

  filterRestaurants: async (filterData) => {
    try {
      const response = await api.post("/restaurants/filter", filterData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to filter restaurants" };
    }
  },

  getRestaurantDetails: async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch restaurant details" };
    }
  },

  selectRestaurant: async (restaurantId) => {
    try {
      const response = await api.post(`/restaurants/${restaurantId}/select`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to select restaurant" };
    }
  },

  rateVisit: async (restaurantId, ratingValue) => {
    try {
      const response = await api.post(`/restaurants/${restaurantId}/rate`, { ratingValue });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to rate restaurant" };
    }
  },

  rateRestaurant: async (visitData) => {
    try {
      const response = await api.post("/restaurants/rate", visitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to submit rating" };
    }
  },
};

export const exploreAPI = {
  getHotRestaurants: async () => {
    try {
      const response = await api.get("/explore/hot");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch hot restaurants" };
    }
  },

  getNewRestaurants: async () => {
    try {
      const response = await api.get("/explore/new");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch new restaurants" };
    }
  },

  getRecommendations: async () => {
    try {
      const response = await api.get("/explore/recommended");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch recommendations" };
    }
  },
};

export const groupAPI = {
  createGroup: async (groupData) => {
    try {
      const response = await api.post("/groups", groupData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create group" };
    }
  },

  getMyGroups: async () => {
    try {
      const response = await api.get("/groups/my");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch groups" };
    }
  },

  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search?q=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to search users" };
    }
  },

  sendInvitation: async (groupId, userId) => {
    try {
      const response = await api.post(`/groups/${groupId}/invite`, { userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send invitation" };
    }
  },

  respondToInvitation: async (groupId, status) => {
    try {
      const response = await api.post(`/groups/${groupId}/respond`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to respond to invitation" };
    }
  },

  startSession: async (groupId, sessionName) => {
    try {
      const response = await api.post(`/groups/${groupId}/sessions`, { sessionName });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to start session" };
    }
  },

  submitPreferences: async (sessionId, preferences) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to submit preferences" };
    }
  },

  calculateTopsis: async (sessionId, preferences, restaurants) => {
    try {
      const response = await topsisApi.post("/topsis/calculate", {
        session_id: sessionId,
        preferences,
        restaurants,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "TOPSIS calculation failed" };
    }
  },

  vote: async (sessionId, restaurantId, voteType) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/vote`, {
        restaurantId,
        vote: voteType,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to submit vote" };
    }
  },

  getSessionResults: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/results`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch session results" };
    }
  },
};

export const leaderboardAPI = {
  getLeaderboard: async () => {
    try {
      const response = await api.get("/leaderboard");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch leaderboard" };
    }
  },

  getGroupPoints: async (groupId) => {
    try {
      const response = await api.get(`/leaderboard/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch group points" };
    }
  },
};

export const adminAPI = {
  getPendingRestaurants: async () => {
    try {
      const response = await api.get("/admin/restaurants/pending");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch pending restaurants" };
    }
  },

  approveRestaurant: async (restaurantId) => {
    try {
      const response = await api.post(`/admin/restaurants/${restaurantId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to approve restaurant" };
    }
  },

  getDeletionRequests: async () => {
    try {
      const response = await api.get("/admin/deletion-requests");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch deletion requests" };
    }
  },
};

export const cfAPI = {
  getRecommendations: async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw { message: "User not logged in" };
      }

      const user = JSON.parse(storedUser);
      if (!user?.userId) {
        throw { message: "Invalid user session" };
      }

      const response = await api.get(`/recommendations/${user.userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch CF recommendations" };
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
  admin: adminAPI,
  cf: cfAPI,
  topsis: topsisApi,
};

export default API;
