import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Users, Store, XCircle, ClipboardList } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  // Main dashboard numbers
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRestaurants: 0,
    pendingRestaurants: 0,
    approvedRestaurants: 0,
    rejectedRestaurants: 0,
  });

  // Small tables on dashboard
  const [pendingRestaurantsList, setPendingRestaurantsList] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  // Load all dashboard data when page opens
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get stats + pending restaurants + deletion requests
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, pendingRes, deletionRes] = await Promise.all([
        fetch("http://localhost:8080/api/admin/dashboard/stats"),
        fetch("http://localhost:8080/api/admin/restaurants/pending"),
        fetch("http://localhost:8080/api/admin/users/deletion-requests"),
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const deletionData = await deletionRes.json();

      if (!statsRes.ok) {
        throw new Error(statsData.message || "Failed to load dashboard stats");
      }

      setStats(statsData);
      setPendingRestaurantsList(Array.isArray(pendingData) ? pendingData.slice(0, 5) : []);
      setDeletionRequests(Array.isArray(deletionData) ? deletionData.slice(0, 5) : []);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Top cards
  const kpis = [
    { title: "Active Users", value: stats.activeUsers, icon: Users },
    { title: "Pending Approvals", value: stats.pendingRestaurants, icon: ClipboardList },
    { title: "Rejected Restaurants", value: stats.rejectedRestaurants, icon: XCircle },
    { title: "Total Restaurants", value: stats.totalRestaurants, icon: Store },
  ];

  // Chart data
  const growthData = [
    { label: "Jan", restaurants: 12 },
    { label: "Feb", restaurants: 18 },
    { label: "Mar", restaurants: 25 },
    { label: "Apr", restaurants: 33 },
    { label: "May", restaurants: 42 },
    { label: "Jun", restaurants: stats.totalRestaurants || 55 },
  ];

  // Pie chart split
  const approvalSplit = [
    { name: "Approved", value: stats.approvedRestaurants },
    { name: "Pending", value: stats.pendingRestaurants },
    { name: "Rejected", value: stats.rejectedRestaurants },
  ];

  const totalProcessed =
    stats.approvedRestaurants +
    stats.pendingRestaurants +
    stats.rejectedRestaurants;

  // Budget text cleaner
  const formatBudget = (budgetRange) => {
    switch (budgetRange) {
      case "ZERO_TO_1000":
        return "LKR 0 - 1000";
      case "ONE_TO_2000":
        return "LKR 1000 - 2000";
      case "TWO_TO_5000":
        return "LKR 2000 - 5000";
      case "FIVE_THOUSAND_PLUS":
        return "LKR 5000+";
      default:
        return budgetRange || "-";
    }
  };

  return (
    <AdminLayout>
      {/* Welcome */}
      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Admin
          </span>{" "}
          👋
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Here’s a quick snapshot of platform activity and monitoring.
        </p>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <div
              key={index}
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                <Icon size={18} />
              </div>

              <div className="mt-4 text-3xl font-extrabold text-gray-900">
                {loading ? "..." : kpi.value}
              </div>

              <div className="mt-1 text-sm text-gray-500">{kpi.title}</div>
            </div>
          );
        })}
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Restaurant Growth
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Monthly restaurant count trend
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 bg-white">
              2026
            </span>
          </div>

          {/* Fixed height so chart doesn't leave a huge empty space */}
          <div style={{ height: "260px", marginTop: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="restaurants"
                  radius={[12, 12, 0, 0]}
                  fill="url(#barGradient)"
                />

                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff512f" stopOpacity={0.95} />
                    <stop offset="95%" stopColor="#dd2476" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition">
          <h2 className="text-xl font-bold text-gray-900">Approval Split</h2>
          <p className="text-sm text-gray-500 mt-1">
            Approved vs Pending vs Rejected
          </p>

          <div className="flex items-center gap-4 mt-4">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalSplit}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1">
              <div className="text-2xl font-extrabold text-gray-900">
                {loading ? "..." : totalProcessed}
              </div>
              <div className="text-sm text-gray-500">Total processed</div>

              <div className="mt-3 grid gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100">
                  ● Approved: {stats.approvedRestaurants}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                  ● Pending: {stats.pendingRestaurants}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-red-50 text-red-700 border-red-100">
                  ● Rejected: {stats.rejectedRestaurants}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom cards */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        {/* Pending restaurants */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Latest Pending Restaurants
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Restaurants waiting for admin approval
              </p>
            </div>

            <div className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 bg-white">
              {pendingRestaurantsList.length} shown
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {pendingRestaurantsList.length === 0 ? (
              <p className="text-sm text-gray-500">No pending restaurants right now.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-3 pr-4 font-semibold">Name</th>
                    <th className="py-3 pr-4 font-semibold">Address</th>
                    <th className="py-3 pr-4 font-semibold">Budget</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {pendingRestaurantsList.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-4 font-semibold text-gray-900">
                        {restaurant.name}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        {restaurant.address || "-"}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        {formatBudget(restaurant.budgetRange)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Deletion requests */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Latest Deletion Requests
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Users requesting account deletion
              </p>
            </div>

            <div className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 bg-white">
              {deletionRequests.length} shown
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {deletionRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No deletion requests right now.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-3 pr-4 font-semibold">Username</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {deletionRequests.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-4 font-semibold text-gray-900">
                        {user.username}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-100">
                          Delete Request
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}