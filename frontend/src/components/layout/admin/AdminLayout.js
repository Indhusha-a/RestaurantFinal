import { useState, useEffect } from "react";
import "../../../styles/admin.css";
import { NavLink } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Users,
  PlusCircle,
  ClipboardCheck,
  List
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [notifications, setNotifications] = useState(0);

  // Load notification count once
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Count pending restaurants + deletion requests
  const fetchNotifications = async () => {
    try {
      const [pendingRes, deletionRes] = await Promise.all([
        fetch("http://localhost:8080/api/admin/restaurants/pending"),
        fetch("http://localhost:8080/api/admin/users/deletion-requests"),
      ]);

      const pending = await pendingRes.json();
      const deletion = await deletionRes.json();

      const count =
        (Array.isArray(pending) ? pending.length : 0) +
        (Array.isArray(deletion) ? deletion.length : 0);

      setNotifications(count);
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

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
          <div className="admin-top-actions">
            {/* Notifications */}
            <button
              className="admin-icon-btn"
              title="Notifications"
              style={{ position: "relative" }}
              onClick={() => window.location.href = "/admin/restaurants"}
            >
              <Bell size={18} />

              {/* Small badge */}
              {notifications > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#ef4444",
                    color: "white",
                    fontSize: "10px",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontWeight: "bold"
                  }}
                >
                  {notifications}
                </span>
              )}
            </button>

            {/* Open user side */}
            <button
              className="primary-button"
              style={{ height: 40, padding: "0 16px" }}
              onClick={() => window.open("http://localhost:3000", "_blank")}
            >
              User View
            </button>

            {/* Role badge */}
            <div className="admin-pill">Admin</div>
          </div>
        </div>

         {children}
      </main>
    </div>
  );
}