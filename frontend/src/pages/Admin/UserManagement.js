import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Users, Trash2 } from "lucide-react";

export default function UserManagement() {

  // store users
  const [users, setUsers] = useState([]);

  // store deletion requests
  const [requests, setRequests] = useState([]);

  // load data on page load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await fetch("http://localhost:8080/api/admin/users");
      const reqRes = await fetch("http://localhost:8080/api/admin/users/deletion-requests");

      const usersData = await usersRes.json();
      const reqData = await reqRes.json();

      setUsers(usersData);
      setRequests(reqData);

    } catch (err) {
      console.error("Error:", err);
    }
  };

  // approve delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      await fetch(`http://localhost:8080/api/admin/users/${id}`, {
        method: "DELETE",
      });

      // remove from UI
      setUsers(users.filter(u => u.userId !== id));
      setRequests(requests.filter(u => u.userId !== id));

    } catch (err) {
      console.error(err);
    }
  };

  return (
  <AdminLayout>

    {/* HEADER */}
    <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          User{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Management
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage users and account deletion requests
        </p>
      </div>

      <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow">
        <Users size={20} />
      </div>
    </section>

    {/* ACTIVE USERS */}
    <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Active Users</h2>
        <span className="text-sm text-gray-500">
          {users.length} users
        </span>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-400 text-sm">No users found</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-gray-400 text-left">
              <th className="py-3 px-4">No</th>
              <th className="py-3 px-4">Username</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, i) => (
              <tr key={u.userId} className="border-b hover:bg-gray-50 transition">
                <td className="py-4 px-4 font-medium">{i + 1}</td>
                <td className="py-4 px-4 font-semibold text-gray-800">
                  {u.username}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>

    {/* DELETION REQUESTS */}
    <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Deletion Requests
        </h2>
        <span className="text-sm text-red-500">
          {requests.length} pending
        </span>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No deletion requests right now
        </p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-gray-400 text-left">
              <th className="py-3 px-4">No</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((u, i) => (
              <tr key={u.userId} className="border-b hover:bg-gray-50 transition">
                <td className="py-4 px-4 font-medium">{i + 1}</td>

                <td className="py-4 px-4 font-semibold text-gray-800">
                  {u.username}
                </td>

                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => handleDelete(u.userId)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                  >
                    <Trash2 size={14} className="inline mr-1" />
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>

  </AdminLayout>
);
}