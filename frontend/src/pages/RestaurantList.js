import { useEffect, useState } from "react";
import API from "../services/api";

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.restaurant.getAllRestaurants()
      .then((data) => {
        console.log("DATA:", data);

        // 🔥 DEBUG EACH IMAGE PATH
        data.forEach((r) => {
          console.log("IMAGE PATH:", r.image1Path);
        });

        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1 className="p-10 text-xl">Loading...</h1>;
  }

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">
        🍽️ Restaurants
      </h1>

      {restaurants.length === 0 && (
        <p className="text-center text-red-500">
          No restaurants found
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {restaurants.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* ✅ SAFE IMAGE HANDLING */}
            <img
              src={
                r.image1Path
                  ? `http://localhost:8080${r.image1Path}`
                  : "https://via.placeholder.com/400x300?text=No+Image"
              }
              alt={r.name || "Restaurant"}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x300?text=Image+Error";
              }}
            />

            {/* CONTENT */}
            <div className="p-5">
              <h2 className="text-xl font-bold">
                {r.name || "No Name"}
              </h2>

              <p className="text-gray-600">
                {r.description || "No description available"}
              </p>

              <p className="text-sm mt-2">
                📞 {r.phone || "N/A"}
              </p>

              <p className="text-sm">
                📍 {r.address || "No address"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}