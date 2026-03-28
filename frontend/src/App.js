import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IndividualMode from "./pages/IndividualMode";
import ExploreMode from "./pages/ExploreMode";
import GroupMode from "./pages/GroupMode";
import Profile from "./pages/Profile";
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

        {/* admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/manage-restaurants" element={<ManageRestaurants />} />
        <Route path="/admin/add-restaurant" element={<AddRestaurant />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/restaurants" element={<RestaurantApproval />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route  /> 
      </Routes>
    </Router>
  );
}

export default App;