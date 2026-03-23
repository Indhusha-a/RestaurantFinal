import { useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Eye, CheckCircle, XCircle, Store } from "lucide-react";
import { restaurantApprovals } from "../../data/dummyData";

export default function RestaurantApproval() {

  // ✅ correct place + correct data
  const [restaurants, setRestaurants] = useState(restaurantApprovals);
  const [selected, setSelected] = useState(null);

  /* Approve / Reject */
  const handleAction = (id) => {
    setRestaurants(restaurants.filter((r) => r.id !== id));
  };

  return (
    <AdminLayout>

      {/* HEADER */}
      <section className="bg-white border rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Restaurant{" "}
            <span className="text-orange-500">Approvals</span>
          </h1>

          <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center">
            <Store size={20} />
          </div>
        </div>
      </section>

      {/* TABLE */}
      <section className="bg-white border rounded-2xl p-6 mt-5">
        <table className="min-w-full text-sm">

          <thead>
            <tr className="border-b text-gray-500 text-left">
              <th className="py-3 px-4">No</th>
              <th className="py-3 px-4">Restaurant</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.map((r, index) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">

                <td className="py-4 px-4">{index + 1}</td>

                <td className="py-4 px-4 font-semibold">
                  {r.restaurantName}
                </td>

                <td className="py-4 px-4">
                  <div className="flex justify-center gap-2">

                    {/* VIEW */}
                    <button
                      onClick={() => setSelected(r)}
                      className="w-9 h-9 border rounded-xl flex items-center justify-center hover:bg-gray-100"
                    >
                      <Eye size={16} />
                    </button>

                    {/* APPROVE */}
                    <button
                      onClick={() => handleAction(r.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs"
                    >
                      <CheckCircle size={14} className="inline mr-1" />
                      Approve
                    </button>

                    {/* REJECT */}
                    <button
                      onClick={() => handleAction(r.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs"
                    >
                      <XCircle size={14} className="inline mr-1" />
                      Reject
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </section>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[500px] overflow-hidden shadow-lg">

            <img
              src={selected.image}
              alt="restaurant"
              className="w-full h-48 object-cover"
            />

            <div className="p-6">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selected.restaurantName}
                </h2>

                <button onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">

                <p><b>Phone:</b></p>
                <p>{selected.phone}</p>

                <p><b>Budget:</b></p>
                <p>{selected.budgetRange}</p>

                <p><b>Location:</b></p>
                <a href={selected.location} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  View Map
                </a>

                <p className="col-span-2 mt-2">
                  <b>Address:</b> {selected.address}
                </p>

                <p className="col-span-2 mt-2">
                  <b>Description:</b><br />
                  {selected.description}
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </AdminLayout>
  );
}