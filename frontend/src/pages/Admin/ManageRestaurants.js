import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Eye, Pencil, Trash2, Store } from "lucide-react";

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8080/api/admin/restaurants");

      if (!response.ok) {
        throw new Error("Failed to load restaurants");
      }

      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const statusClass = (status) => {
    if (status === "Approved") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    if (status === "Pending") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-gray-50 text-gray-700 border-gray-100";
  };

  const activeClass = (active) => {
    if (active === "Active") {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }
    return "bg-red-50 text-red-700 border-red-100";
  };

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

  const formatApprovalStatus = (isApproved) => {
    return isApproved ? "Approved" : "Pending";
  };

  const formatActiveStatus = (isActive) => {
    return isActive ? "Active" : "Inactive";
  };

  return (
    <AdminLayout>
      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Manage{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Restaurants
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              View and manage all added restaurants in one place.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
            <Store size={20} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Restaurant List</h2>
            <p className="text-sm text-gray-500 mt-1">
              Restaurants loaded from backend
            </p>
          </div>

          <div className="px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700">
            Total: {restaurants.length}
          </div>
        </div>

        {loading && (
          <p className="mt-5 text-sm text-gray-500">Loading restaurants...</p>
        )}

        {error && (
          <p className="mt-5 text-sm text-red-600">Error: {error}</p>
        )}

        {!loading && !error && (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-3 pr-4 font-semibold">No</th>
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Address</th>
                  <th className="py-3 pr-4 font-semibold">Phone</th>
                  <th className="py-3 pr-4 font-semibold">Budget</th>
                  <th className="py-3 pr-4 font-semibold">Approval</th>
                  <th className="py-3 pr-4 font-semibold">Active</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {restaurants.length > 0 ? (
                  restaurants.map((restaurant, index) => {
                    const approvalStatus = formatApprovalStatus(restaurant.isApproved);
                    const activeStatus = formatActiveStatus(restaurant.isActive);

                    return (
                      <tr key={restaurant.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 pr-4 font-semibold text-gray-900">
                          {index + 1}
                        </td>
                        <td className="py-4 pr-4 text-gray-800 font-semibold">
                          {restaurant.name}
                        </td>
                        <td className="py-4 pr-4 text-gray-700">
                          {restaurant.address}
                        </td>
                        <td className="py-4 pr-4 text-gray-700">
                          {restaurant.phone || "-"}
                        </td>
                        <td className="py-4 pr-4 text-gray-700">
                          {formatBudget(restaurant.budgetRange)}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass(
                              approvalStatus
                            )}`}
                          >
                            {approvalStatus}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${activeClass(
                              activeStatus
                            )}`}
                          >
                            {activeStatus}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="w-9 h-9 rounded-xl border border-red-100 text-red-600 flex items-center justify-center hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-gray-500">
                      No restaurants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}