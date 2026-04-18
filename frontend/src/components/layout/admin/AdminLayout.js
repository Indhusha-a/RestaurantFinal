import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  List,
  LogOut,
  PlusCircle,
  Users,
  X,
} from "lucide-react";
import "../../../styles/admin.css";

export default function AdminLayout({ children }) {
  const [notifications, setNotifications] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [pendingRes, deletionRes] = await Promise.all([
        fetch("http://localhost:8080/api/admin/restaurants/pending"),
        fetch("http://localhost:8080/api/admin/users/deletion-requests"),
      ]);

      const pending = await pendingRes.json();
      const deletion = await deletionRes.json();

      const pendingItems = Array.isArray(pending) ? pending : [];
      const deletionItems = Array.isArray(deletion) ? deletion : [];

      setPendingRestaurants(pendingItems.slice(0, 5));
      setDeletionRequests(deletionItems.slice(0, 5));
      setNotifications(pendingItems.length + deletionItems.length);
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  return (
    <div className="admin-shell">
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

          <NavLink
            to="/admin/monitoring"
            className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          >
            <span className="admin-link-icon">
              <LayoutDashboard size={18} />
            </span>
            System Monitoring
          </NavLink>
        </nav>

        <div style={{ marginTop: "auto", padding: "16px" }}>
          <button
            className="admin-link"
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
            }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
          >
            <span className="admin-link-icon">
              <LogOut size={18} />
            </span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-topbar" style={{ position: "relative" }}>
          <div className="admin-top-actions">
            <button
              className="admin-icon-btn"
              title="Notifications"
              style={{ position: "relative" }}
              onClick={() => {
                fetchNotifications();
                setShowNotificationPanel((current) => !current);
              }}
            >
              <Bell size={18} />
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
                    fontWeight: "bold",
                  }}
                >
                  {notifications}
                </span>
              )}
            </button>

            {showNotificationPanel && (
              <div
                style={{
                  position: "absolute",
                  top: 64,
                  right: 24,
                  width: 320,
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 20,
                  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
                  padding: 16,
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827" }}>
                      Admin Notifications
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      Pending approvals and deletion requests
                    </div>
                  </div>
                  <button
                    className="admin-icon-btn"
                    style={{ width: 32, height: 32 }}
                    onClick={() => setShowNotificationPanel(false)}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <div
                    style={{
                      border: "1px solid #f3f4f6",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "#f97316",
                        marginBottom: 8,
                      }}
                    >
                      Pending Restaurants
                    </div>
                    {pendingRestaurants.length === 0 ? (
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        No pending restaurant approvals.
                      </div>
                    ) : (
                      pendingRestaurants.map((restaurant) => (
                        <div
                          key={restaurant.id}
                          style={{
                            fontSize: 13,
                            color: "#111827",
                            marginBottom: 6,
                          }}
                        >
                          {restaurant.name}
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    style={{
                      border: "1px solid #f3f4f6",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "#ec4899",
                        marginBottom: 8,
                      }}
                    >
                      Deletion Requests
                    </div>
                    {deletionRequests.length === 0 ? (
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        No user deletion requests.
                      </div>
                    ) : (
                      deletionRequests.map((user) => (
                        <div
                          key={user.userId}
                          style={{
                            fontSize: 13,
                            color: "#111827",
                            marginBottom: 6,
                          }}
                        >
                          @{user.username}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              className="primary-button"
              style={{ height: 40, padding: "0 16px" }}
              onClick={() => window.open("http://localhost:3000", "_blank")}
            >
              User View
            </button>

            <div className="admin-pill">Admin</div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
