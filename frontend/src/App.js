import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IndividualMode from "./pages/IndividualMode";
import ExploreMode from "./pages/ExploreMode";
import GroupMode from "./pages/GroupMode";
import Profile from "./pages/Profile";


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
         
      </Routes>
    </Router>
  );
}

export default App;