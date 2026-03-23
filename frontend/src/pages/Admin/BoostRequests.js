import { useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { boostRequests as initialBoosts } from "../../data/dummyData";

export default function BoostRequests() {

  /* -----------------------------
     State to store boost requests
     Initially loaded from dummyData
  ------------------------------ */
  const [boosts, setBoosts] = useState(initialBoosts);

  /* -----------------------------
     Handle approve / reject action
     Removes the boost request
     from the list after action
  ------------------------------ */
  const handleAction = (id) => {
    setBoosts(boosts.filter(boost => boost.id !== id));
  };

  return (
    <AdminLayout>

      {/* -----------------------------
          Page Title
      ------------------------------ */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Boost Requests
      </h1>

      {/* -----------------------------
          Message if no boosts exist
      ------------------------------ */}
      {boosts.length === 0 && (
        <p className="text-gray-500">
          No pending boosts.
        </p>
      )}

      {/* -----------------------------
          Boost Request Cards
      ------------------------------ */}
      <div className="grid gap-5">

        {boosts.map(boost => (

          <div
            key={boost.id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition"
          >

            {/* Restaurant Name */}
            <h3 className="text-lg font-bold text-gray-900">
              {boost.restaurant}
            </h3>

            {/* Boost Details */}
            <p className="text-sm text-gray-600 mt-2">
              Duration: {boost.duration}
            </p>

            <p className="text-sm text-gray-600">
              Amount: {boost.amount}
            </p>

            {/* -----------------------------
                Action Buttons
            ------------------------------ */}
            <div className="mt-5 flex gap-3">

              {/* Approve Button */}
              <button
                onClick={() => handleAction(boost.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Approve
              </button>

              {/* Reject Button */}
              <button
                onClick={() => handleAction(boost.id)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Reject
              </button>

            </div>

          </div>

        ))}

      </div>

    </AdminLayout>
  );
}