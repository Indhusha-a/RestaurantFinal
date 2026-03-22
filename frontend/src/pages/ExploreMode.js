import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, MapPin, Phone, Loader, AlertCircle } from "lucide-react";
import API from "../services/api";

export default function ExploreMode() {

  const [restaurants, setRestaurants] = useState([]);
  const [topWeeklyRestaurants, setTopWeeklyRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const [recommendationData, topWeeklyData] = await Promise.all([
        API.cf.getRecommendations(),
        API.restaurant.getTopWeeklyRestaurants()
      ]);

      if (Array.isArray(recommendationData)) {
        setRestaurants(recommendationData);
      } else {
        setRestaurants([]);
      }

      if (Array.isArray(topWeeklyData)) {
        setTopWeeklyRestaurants(topWeeklyData);
      } else {
        setTopWeeklyRestaurants([]);
      }

    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError(err.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto relative">

      {/* Header Section */}
      <div className="mb-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center mb-6"
        >
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
          ML <span className="text-gradient">Recommendations</span>
        </h1>

        <p className="text-lg text-muted-foreground">
          Personalized picks based on your past ratings
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <Loader className="w-10 h-10 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Generating recommendations...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && restaurants.length === 0 && !error && (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 mx-auto text-primary/40 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground">
            Rate more restaurants to improve your recommendations.
          </p>
        </div>
      )}

      {!loading && (topWeeklyRestaurants.length > 0 || restaurants.length > 0) && (
        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
          <aside className="lg:sticky lg:top-6">
            <div className="bg-card rounded-2xl border border-border/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Top 10 This Week</h2>
                <span className="text-xs text-muted-foreground">By points</span>
              </div>

              {topWeeklyRestaurants.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No weekly top restaurants available right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {topWeeklyRestaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.restaurantId ?? restaurant.id ?? index}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-start gap-3 rounded-xl border border-border/50 p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{restaurant.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {restaurant.address || "Colombo"}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-primary font-medium">
                            {restaurant.points ?? 0} pts
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {restaurant.averageRating || "New"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section>
            {restaurants.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Recommended for you ({restaurants.length})
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {restaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-card rounded-2xl border-2 border-border/50 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            restaurant.image1Path ||
                            "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3"
                          }
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {restaurant.averageRating || "New"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">
                          {restaurant.name}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4">
                          {restaurant.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {restaurant.address || "Colombo"}
                          </span>

                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone || "N/A"}
                          </span>
                        </div>

                        <div className="text-sm font-medium text-primary">
                           {restaurant.budgetRange}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
