import axios from 'axios';

// Base URLs
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const TOPSIS_URL = process.env.REACT_APP_TOPSIS_URL || 'http://localhost:5000/api';

// Create axios instances
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const topsisApi = axios.create({
  baseURL: TOPSIS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const actualToken = response.data.token || response.data.data?.token;
      const userObj = response.data.user || response.data.data?.user || response.data.data;
      
      if (actualToken) {
        localStorage.setItem('token', actualToken);
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data;
      const actualToken = data.token;
      
      // FIX: Backend returns user fields at root level, not nested in 'user' object
      const userObj = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarIcon: data.avatarIcon || 'neutral'
      };

      if (actualToken) {
        localStorage.setItem('token', actualToken);
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      return { ...data, user: userObj }; // Return with user object for convenience
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  checkUsername: async (username) => {
    try {
      const response = await api.get(`/auth/check-username/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Username check failed' };
    }
  },

  checkEmail: async (email) => {
    try {
      const response = await api.get(`/auth/check-email/${email}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Email check failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!(token && token !== 'undefined' && token !== 'null');
  }
};

export const userAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      const updatedUser = response.data.data || response.data.user;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  requestDeletion: async () => {
    try {
      const response = await api.post('/users/deletion-request');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to request deletion' };
    }
  },

  getVisitHistory: async () => {
    try {
      const response = await api.get('/users/visits');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch visit history' };
    }
  }
};

export const restaurantAPI = {
  getTags: async () => {
    try {
      const response = await api.get('/restaurants/tags');
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tags' };
    }
  },

  getSpecialties: async () => {
    try {
      const response = await api.get('/restaurants/specialties');
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch specialties' };
    }
  },

  filterRestaurants: async (filterData) => {
    try {
      const response = await api.post('/restaurants/filter', filterData);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to filter restaurants' };
    }
  },

  getRestaurantDetails: async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch restaurant details' };
    }
  },

  rateRestaurant: async (visitData) => {
    try {
      const response = await api.post('/restaurants/rate', visitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit rating' };
    }
  },

  selectRestaurant: async (restaurantId) => {
    try {
      const response = await api.post('/restaurants/select', { restaurantId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to select restaurant' };
    }
  }
};

export const exploreAPI = {
  getHotRestaurants: async () => {
    try {
      const response = await api.get('/explore/hot');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch hot restaurants' };
    }
  },

  getNewRestaurants: async () => {
    try {
      const response = await api.get('/explore/new');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch new restaurants' };
    }
  },

  getRecommendations: async () => {
    try {
      const response = await api.get('/explore/recommended');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recommendations' };
    }
  }
};

export const groupAPI = {
  createGroup: async (groupData) => {
    try {
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create group' };
    }
  },

  getMyGroups: async () => {
    try {
      const response = await api.get('/groups/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch groups' };
    }
  },

  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search?q=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search users' };
    }
  },

  sendInvitation: async (groupId, userId) => {
    try {
      const response = await api.post(`/groups/${groupId}/invite`, { userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send invitation' };
    }
  },

  respondToInvitation: async (groupId, status) => {
    try {
      const response = await api.post(`/groups/${groupId}/respond`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to respond to invitation' };
    }
  },

  startSession: async (groupId, sessionName) => {
    try {
      const response = await api.post(`/groups/${groupId}/sessions`, { sessionName });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to start session' };
    }
  },

  submitPreferences: async (sessionId, preferences) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit preferences' };
    }
  },

  calculateTopsis: async (sessionId, preferences, restaurants) => {
    try {
      const response = await topsisApi.post('/topsis/calculate', {
        session_id: sessionId,
        preferences,
        restaurants
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'TOPSIS calculation failed' };
    }
  },

  vote: async (sessionId, restaurantId, voteType) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/vote`, {
        restaurantId,
        vote: voteType
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit vote' };
    }
  },

  getSessionResults: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/results`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch session results' };
    }
  }
};

export const leaderboardAPI = {
  getLeaderboard: async () => {
    try {
      const response = await api.get('/leaderboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch leaderboard' };
    }
  },

  getGroupPoints: async (groupId) => {
    try {
      const response = await api.get(`/leaderboard/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch group points' };
    }
  }
};

export const adminAPI = {
  getPendingRestaurants: async () => {
    try {
      const response = await api.get('/admin/restaurants/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pending restaurants' };
    }
  },

  approveRestaurant: async (restaurantId) => {
    try {
      const response = await api.post(`/admin/restaurants/${restaurantId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve restaurant' };
    }
  },

  getDeletionRequests: async () => {
    try {
      const response = await api.get('/admin/deletion-requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch deletion requests' };
    }
  }
};

const API = {
  auth: authAPI,
  user: userAPI,
  restaurant: restaurantAPI,
  explore: exploreAPI,
  group: groupAPI,
  leaderboard: leaderboardAPI,
  admin: adminAPI
};

export default API;