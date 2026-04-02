import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IndividualMode from "./pages/IndividualMode";
import ExploreMode from "./pages/ExploreMode";
import GroupMode from "./pages/GroupMode";
import Profile from "./pages/Profile";

import RestaurantRegister from "./pages/RestaurantRegister";
import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantPortal from "./pages/RestaurantPortal";
import RestaurantList from "./pages/RestaurantList";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageRestaurants from "./pages/Admin/ManageRestaurants";
import RestaurantApproval from "./pages/Admin/RestaurantApproval";
import UserManagement from "./pages/Admin/UserManagement";
import AddRestaurant from "./pages/Admin/AddRestaurants";
import AdminLogin from "./pages/Admin/AdminLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/individual" element={<IndividualMode />} />
        <Route path="/dashboard/explore" element={<ExploreMode />} />
        <Route path="/dashboard/group" element={<GroupMode />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/manage-restaurants"
          element={<ManageRestaurants />}
        />
        <Route path="/admin/add-restaurant" element={<AddRestaurant />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/restaurants" element={<RestaurantApproval />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Restaurant routes */}
        <Route
          path="/restaurant-register"
          element={<RestaurantRegister />}
        />
        <Route path="/restaurant-login" element={<RestaurantLogin />} />
        <Route path="/restaurant-dashboard" element={<RestaurantPortal />} />
        <Route path="/restaurants" element={<RestaurantList />} />
      </Routes>
    </Router>
  );
}

export default App;