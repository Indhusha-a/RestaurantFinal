import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Users, Store, Rocket, ClipboardList } from "lucide-react";
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
  /* -----------------------------
     KPI cards data (top row)
  ------------------------------ */
  const kpis = [
    { title: "Active Users", value: 120, icon: Users },
    { title: "Pending Approvals", value: 5, icon: ClipboardList },
    { title: "Active Boosts", value: 8, icon: Rocket },
    { title: "Total Restaurants", value: 40, icon: Store },
  ];

  /* -----------------------------
     Bar chart data (monthly growth)
  ------------------------------ */
  const growthData = [
    { label: "Jan", restaurants: 12 },
    { label: "Feb", restaurants: 18 },
    { label: "Mar", restaurants: 25 },
    { label: "Apr", restaurants: 33 },
    { label: "May", restaurants: 42 },
    { label: "Jun", restaurants: 55 },
  ];

  /* -----------------------------
     Pie chart data (approval split)
  ------------------------------ */
  const yearly = [
    { name: "Approved", value: 72 },
    { name: "Pending", value: 28 },
  ];

  /* -----------------------------
     Recent activity list (right side)
  ------------------------------ */
  const recent = [
    { time: "09:30", text: 'New restaurant submitted: "Cafe Aroma"', badge: "pending" },
    { time: "10:05", text: "Boost request received: Spicy Villa (7 days)", badge: "boost" },
    { time: "11:20", text: "User role updated: Dilani → Owner", badge: "approved" },
    { time: "12:10", text: "Restaurant approved: Urban Bites", badge: "approved" },
  ];

  /* Small helper: status badge styles */
  const badgeClass = (type) => {
    switch (type) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "boost":
        return "bg-pink-50 text-pink-700 border-pink-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <AdminLayout>
      {/* =========================
          WELCOME BANNER
      ========================== */}
      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Admin
          </span>{" "}
          👋
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Here’s a quick snapshot of platform activity and growth.
        </p>
      </section>

      {/* =========================
          KPI ROW
      ========================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {kpis.map((k, idx) => {
          const Icon = k.icon;

          return (
            <div
              key={idx}
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition"
            >
              {/* KPI icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                <Icon size={18} />
              </div>

              {/* KPI value */}
              <div className="mt-4 text-3xl font-extrabold text-gray-900">
                {k.value}
              </div>

              {/* KPI label */}
              <div className="mt-1 text-sm text-gray-500">{k.title}</div>
            </div>
          );
        })}
      </section>

      {/* =========================
          MAIN GRID:
          Left = Bar chart
          Right = Pie + Recent activity
      ========================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        {/* ---------- LEFT: Bar chart (takes 2 columns on xl) ---------- */}
        <div className="xl:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          {/* Chart header */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Restaurant Growth
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Monthly restaurant count trend
              </p>
            </div>

            {/* Year pill */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 bg-white">
              2026
            </span>
          </div>

          {/* Chart area */}
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />

                {/* Bar uses gradient fill defined below */}
                <Bar
                  dataKey="restaurants"
                  radius={[12, 12, 0, 0]}
                  fill="url(#barGradient)"
                />

                {/* Gradient definition */}
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

        {/* ---------- RIGHT: Widgets stack ---------- */}
        <div className="grid gap-5">
          {/* Approval split (pie) */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition">
            <h2 className="text-xl font-bold text-gray-900">Approval Split</h2>
            <p className="text-sm text-gray-500 mt-1">Approved vs Pending</p>

            <div className="flex items-center gap-4 mt-4">
              {/* Pie chart */}
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={yearly}
                      dataKey="value"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      <Cell fill="#10b981" /> {/* Approved */}
                      <Cell fill="#f59e0b" /> {/* Pending */}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1">
                <div className="text-2xl font-extrabold text-gray-900">
                  100%
                </div>
                <div className="text-sm text-gray-500">Total processed</div>

                <div className="mt-3 grid gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100">
                    ● Approved: 72%
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                    ● Pending: 28%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500 mt-1">Latest actions & events</p>

            <div className="mt-4 grid gap-3">
              {recent.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start p-3 rounded-2xl border border-gray-100 bg-white"
                >
                  {/* Time pill */}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 bg-white">
                    {r.time}
                  </span>

                  {/* Text + badge */}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {r.text}
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass(
                          r.badge
                        )}`}
                      >
                        {r.badge === "pending" && "Pending"}
                        {r.badge === "approved" && "Approved"}
                        {r.badge === "boost" && "Boost"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          RECENT REQUESTS TABLE
      ========================== */}
      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-5">
        <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
        <p className="text-sm text-gray-500 mt-1">
          Approvals / boosts / registrations
        </p>

        {/* Table container for horizontal scroll on small screens */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            {/* Table head */}
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 pr-4 font-semibold">Type</th>
                <th className="py-3 pr-4 font-semibold">Name</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Priority</th>
              </tr>
            </thead>

            {/* Table body */}
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition">
                <td className="py-3 pr-4 font-semibold text-gray-900">#R-102</td>
                <td className="py-3 pr-4 text-gray-700">Restaurant</td>
                <td className="py-3 pr-4 text-gray-700">Cafe Aroma</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                    Pending
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-700">High</td>
              </tr>

              <tr className="hover:bg-gray-50 transition">
                <td className="py-3 pr-4 font-semibold text-gray-900">#B-077</td>
                <td className="py-3 pr-4 text-gray-700">Boost</td>
                <td className="py-3 pr-4 text-gray-700">Spicy Villa</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-pink-50 text-pink-700 border-pink-100">
                    Review
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-700">Medium</td>
              </tr>

              <tr className="hover:bg-gray-50 transition">
                <td className="py-3 pr-4 font-semibold text-gray-900">#U-221</td>
                <td className="py-3 pr-4 text-gray-700">User</td>
                <td className="py-3 pr-4 text-gray-700">Dilani Perera</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-100">
                    Verified
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-700">Low</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}