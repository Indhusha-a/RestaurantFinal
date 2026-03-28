import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Eye, CheckCircle, XCircle, Store } from "lucide-react";

export default function RestaurantApproval() {

  // =========================
  // STATES
  // =========================
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔴 reject modal states
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // =========================
  // FETCH PENDING RESTAURANTS
  // =========================
  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/api/admin/restaurants/pending");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch restaurants");
      }

      setRestaurants(data);

    } catch (error) {
      console.error("Error fetching pending restaurants:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  // =========================
  // APPROVE
  // =========================
  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/restaurants/${id}/approve`,
        { method: "PUT" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve restaurant");
      }

      // remove from list after approving
      setRestaurants(restaurants.filter((r) => r.id !== id));

      if (selected && selected.id === id) {
        setSelected(null);
      }

      alert("Restaurant approved successfully");

    } catch (error) {
      console.error("Approve error:", error);
      alert(error.message);
    }
  };

  // =========================
  // OPEN REJECT MODAL
  // =========================
  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectReason("");
  };

  // =========================
  // CONFIRM REJECT
  // =========================
  const confirmReject = async () => {

    // simple validation
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/restaurants/${rejectId}/reject`,
        {
          method: "POST", // ✅ changed from DELETE
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: rejectReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject restaurant");
      }

      // remove from pending list
      setRestaurants(restaurants.filter((r) => r.id !== rejectId));

      // close modals
      setRejectId(null);
      setRejectReason("");

      if (selected && selected.id === rejectId) {
        setSelected(null);
      }

      alert("Restaurant rejected successfully");

    } catch (error) {
      console.error("Reject error:", error);
      alert(error.message);
    }
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
      return budgetRange || "N/A";
  }
};

  return (
    <AdminLayout>

      {/* ================= HEADER ================= */}
      <section className="bg-white border rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Restaurant <span className="text-orange-500">Approvals</span>
          </h1>

          <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center">
            <Store size={20} />
          </div>
        </div>
      </section>

      {/* ================= TABLE ================= */}
      <section className="bg-white border rounded-2xl p-6 mt-5">

        {loading ? (
          <p className="text-gray-500">Loading pending restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-gray-500">No pending restaurants found.</p>
        ) : (
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

                  <td className="py-4 px-4 font-semibold">{r.name}</td>

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
                        onClick={() => handleApprove(r.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs"
                      >
                        <CheckCircle size={14} className="inline mr-1" />
                        Approve
                      </button>

                      {/* REJECT */}
                      <button
                        onClick={() => openRejectModal(r.id)}
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
        )}
      </section>

      {/* ================= VIEW MODAL ================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[500px] overflow-hidden shadow-lg">

            <img
              src={
                selected.image1Path
                  ? `http://localhost:8080${selected.image1Path}`
                  : "https://via.placeholder.com/500x200?text=No+Image"
              }
              alt="restaurant"
              className="w-full h-48 object-cover"
            />

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><b>Phone:</b></p>
                <p>{selected.phone || "N/A"}</p>

                <p><b>Budget:</b></p>
                <p>{formatBudget(selected.budgetRange)}</p>

                <p><b>Location:</b></p>
                     {selected.locationLink && selected.locationLink.startsWith("http") ? (
                  <a
                    href={selected.locationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Map
                  </a>
                 ) : (
                   <span className="text-gray-500">No valid map link</span>
                 )}

                <p className="col-span-2 mt-2">
                  <b>Address:</b> {selected.address || "N/A"}
                </p>

                <p className="col-span-2 mt-2">
                  <b>Description:</b><br />
                  {selected.description || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECT MODAL ================= */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[400px] p-6 shadow-lg">

            <h2 className="text-lg font-bold mb-3">Reject Restaurant</h2>

            <textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />

            <div className="flex justify-end gap-2 mt-4">

              <button
                onClick={() => setRejectId(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm Reject
              </button>

            </div>

          </div>

        </div>
      )}

    </AdminLayout>
  );
}