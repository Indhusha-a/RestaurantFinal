import { useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Trash2, CheckCircle, XCircle, Users } from "lucide-react";
import { users as initialUsers } from "../../data/dummyData";

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);

  const acceptDeleteRequest = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, deleteRequest: "Accepted" } : user
      )
    );
  };

  const rejectDeleteRequest = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, deleteRequest: "Rejected" } : user
      )
    );
  };

  const statusClass = (status) => {
    if (status === "Active") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    return "bg-red-50 text-red-700 border-red-100";
  };

  const requestClass = (request) => {
    if (request === "Pending") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    if (request === "Accepted") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    if (request === "Rejected") {
      return "bg-red-50 text-red-700 border-red-100";
    }
    return "bg-gray-50 text-gray-700 border-gray-100";
  };

  return (
    <AdminLayout>
      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              User{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              View all registered users and manage profile deletion requests.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Users</h2>
            <p className="text-sm text-gray-500 mt-1">
              User accounts and deletion request statuses
            </p>
          </div>

          <div className="px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700">
            Total: {users.length}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 pr-4 font-semibold">No</th>
                <th className="py-3 pr-4 font-semibold">Name</th>
                <th className="py-3 pr-4 font-semibold">Email</th>
                <th className="py-3 pr-4 font-semibold">Phone</th>
                <th className="py-3 pr-4 font-semibold">Account Status</th>
                <th className="py-3 pr-4 font-semibold">Delete Request</th>
                <th className="py-3 pr-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 pr-4 font-semibold text-gray-900">
                    {index + 1}
                  </td>

                  <td className="py-4 pr-4 text-gray-800 font-semibold">
                    {user.name}
                  </td>

                  <td className="py-4 pr-4 text-gray-700">{user.email}</td>

                  <td className="py-4 pr-4 text-gray-700">{user.phone}</td>

                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${requestClass(
                        user.deleteRequest
                      )}`}
                    >
                      {user.deleteRequest}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    {user.deleteRequest === "Pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptDeleteRequest(user.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                          title="Accept deletion request"
                        >
                          <CheckCircle size={14} />
                          Accept
                        </button>

                        <button
                          onClick={() => rejectDeleteRequest(user.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                          title="Reject deletion request"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No pending action
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Trash2 size={18} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Profile Deletion Policy
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Admin can only accept or reject user profile deletion requests.
              Passwords are not shown and cannot be changed from this page.
            </p>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}