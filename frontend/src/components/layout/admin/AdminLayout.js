import "../../../styles/admin.css";
import { NavLink } from "react-router-dom";
import {
  Bell,
  Search,
  LayoutDashboard,
  Users,
  PlusCircle,
  ClipboardCheck,
  List
} from "lucide-react";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-logo" />
          <div>
            <div className="admin-brand-title">
              <span className="primary-gradient-text">iamhungry</span>
            </div>
            <div className="admin-brand-sub">Admin Console</div>
          </div>
        </div>

        {/* Dashboard section */}
        <div className="admin-section-title">Home</div>
        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          >
            <span className="admin-link-icon">
              <LayoutDashboard size={18} />
            </span>
            Dashboard
          </NavLink>
        </nav>

        {/* Main admin section */}
        <div className="admin-section-title">Admin</div>
        <nav className="admin-nav">
          <NavLink
            to="/admin/restaurants"
            className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          >
            <span className="admin-link-icon">
              <ClipboardCheck size={18} />
            </span>
            Restaurant Approvals
          </NavLink>

          <NavLink
            to="/admin/manage-restaurants"
            className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          >
            <span className="admin-link-icon">
              <List size={18} />
            </span>
            Manage Restaurants
          </NavLink>

          <NavLink
            to="/admin/add-restaurant"
            className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          >
            <span className="admin-link-icon">
              <PlusCircle size={18} />
            </span>
            Add Restaurant
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          >
            <span className="admin-link-icon">
              <Users size={18} />
            </span>
            User Management
          </NavLink>
        </nav>
      </aside>

      {/* Content */}
      <main className="admin-content">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-search">
            <Search size={18} color="#6b7280" />
            <input placeholder="Search restaurants or users..." />
          </div>

          <div className="admin-top-actions">
            <button className="admin-icon-btn" title="Notifications">
              <Bell size={18} />
            </button>

            <button
              className="primary-button"
              style={{ height: 40, padding: "0 16px" }}
            >
              View Site
            </button>

            <div className="admin-pill">Admin</div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}