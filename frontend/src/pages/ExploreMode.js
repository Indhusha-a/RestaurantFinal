import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Star, MapPin, Phone, Globe, Loader, AlertCircle, Navigation, Check, XCircle } from "lucide-react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ExploreMode() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [topWeeklyRestaurants, setTopWeeklyRestaurants] = useState([]);
  const [newRestaurants, setNewRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const [recommendationData, topWeeklyData, newRestaurantsData, allRestaurantData] = await Promise.all([
        API.cf.getRecommendations(),
        API.restaurant.getTopWeeklyRestaurants(),
        API.explore.getNewRestaurants(),
        API.restaurant.getAllRestaurants()
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

      if (Array.isArray(newRestaurantsData)) {
        setNewRestaurants(newRestaurantsData.slice(0, 8));
      } else {
        setNewRestaurants([]);
      }

      if (Array.isArray(allRestaurantData)) {
        setAllRestaurants(allRestaurantData);
      } else {
        setAllRestaurants([]);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError(err.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = searchQuery.trim()
    ? allRestaurants.filter((restaurant) =>
        restaurant.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  const showSearchResults = searchQuery.trim().length > 0;

  const getRestaurantId = (restaurant) => restaurant?.restaurantId ?? restaurant?.id;

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSuccessMessage("");
    setIsConfirmed(false);
    setShowSelectionModal(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedRestaurant) return;

    const restaurantId = getRestaurantId(selectedRestaurant);
    if (!restaurantId) {
      setError("Unable to select this restaurant right now.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await API.restaurant.selectRestaurant(restaurantId);
      setSuccessMessage("Restaurant selected! The owner will confirm your visit.");
      setIsConfirmed(true);
    } catch (err) {
      console.error("Selection failed:", err);
      setError(err.message || "Failed to select restaurant. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishSelection = () => {
    setShowSelectionModal(false);
    setSelectedRestaurant(null);
    setSuccessMessage("");
    setIsConfirmed(false);
    navigate("/dashboard");
  };

  const closeSelectionModal = () => {
    if (submitting) return;
    setShowSelectionModal(false);
    setSelectedRestaurant(null);
    setSuccessMessage("");
    setIsConfirmed(false);
  };

  return (
    <div className="max-w-7xl mx-auto relative px-4 md:px-6 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm mb-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.08),transparent_30%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" />
                Explore places picked for you and trending this week
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                Find your next restaurant faster
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                Search across the full restaurant collection, or browse your personalized recommendations and the weekly top 10.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
              <div className="rounded-2xl border border-border/60 bg-background/85 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weekly Leaders</p>
                <p className="mt-2 text-2xl font-semibold">{topWeeklyRestaurants.length}</p>
                <p className="text-sm text-muted-foreground">Restaurants in the top list</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/85 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">For You</p>
                <p className="mt-2 text-2xl font-semibold">{restaurants.length}</p>
                <p className="text-sm text-muted-foreground">Recommended matches</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative max-w-3xl">
              <Search className="w-5 h-5 text-muted-foreground absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all restaurants by name"
                className="h-14 w-full rounded-2xl border border-border/70 bg-background/95 pl-14 pr-4 text-base outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="rounded-[2rem] border border-border/60 bg-card py-16 text-center">
          <Loader className="w-10 h-10 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Generating recommendations...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && showSearchResults && (
        <section className="rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Search</p>
              <h2 className="text-2xl font-semibold">Search Results</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredRestaurants.length} match{filteredRestaurants.length === 1 ? "" : "es"}
            </span>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-background/70 p-10 text-center text-sm text-muted-foreground">
              No restaurants found for "{searchQuery}".
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={
                        restaurant.image1Path ||
                        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3"
                      }
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold">{restaurant.name}</h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {restaurant.budgetRange}
                      </span>
                    </div>

                    <p className="mb-4 text-sm text-muted-foreground">
                      {restaurant.description}
                    </p>

                    <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {restaurant.address || "Colombo"}
                      </span>

                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {restaurant.phone || "N/A"}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectRestaurant(restaurant)}
                      className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Select Restaurant
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && !showSearchResults && restaurants.length === 0 && !error && (
        <div className="rounded-[2rem] border border-border/60 bg-card py-16 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-primary/40 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground">
            Rate more restaurants to improve your recommendations.
          </p>
        </div>
      )}

      {!loading && !showSearchResults && (topWeeklyRestaurants.length > 0 || restaurants.length > 0 || newRestaurants.length > 0) && (
        <div className="grid items-start gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
              <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Leaderboard</p>
                <div className="mt-1 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Top 10 This Week</h2>
                  <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                    By points
                  </span>
                </div>
              </div>

              {topWeeklyRestaurants.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No weekly top restaurants available right now.
                </p>
              ) : (
                <div className="space-y-3 p-4">
                  {topWeeklyRestaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.restaurantId ?? restaurant.id ?? index}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/80 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{restaurant.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {restaurant.address || "Colombo"}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                            {restaurant.points ?? 0} pts
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {restaurant.averageRating || "New"}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectRestaurant(restaurant)}
                        className="shrink-0 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                      >
                        Select
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section>
            {newRestaurants.length > 0 && (
              <div className="mb-10">
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Fresh Picks</p>
                    <h2 className="text-2xl font-semibold">Newly added restaurants</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {newRestaurants.length} newest approved spots
                  </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {newRestaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.restaurantId ?? restaurant.id ?? index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="group overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={
                            restaurant.image1Path ||
                            "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3"
                          }
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
                        <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                          New
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="text-xl font-bold">{restaurant.name}</h3>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {restaurant.budgetRange || "Flexible"}
                          </span>
                        </div>

                        <p className="mb-5 text-sm leading-6 text-muted-foreground">
                          {restaurant.description}
                        </p>

                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                          <span className="flex items-center gap-2 rounded-2xl bg-background px-3 py-2">
                            <MapPin className="w-4 h-4" />
                            {restaurant.address || "Colombo"}
                          </span>
                          <span className="flex items-center gap-2 rounded-2xl bg-background px-3 py-2">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone || "N/A"}
                          </span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectRestaurant(restaurant)}
                          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          Select Restaurant
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {restaurants.length > 0 && (
              <>
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Personalized</p>
                    <h2 className="text-2xl font-semibold">
                      Recommended for you
                    </h2>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {restaurants.length} restaurant{restaurants.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {restaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={
                            restaurant.image1Path ||
                            "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3"
                          }
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
                        <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                          {restaurant.budgetRange}
                        </div>
                        <div className="absolute right-4 top-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {restaurant.averageRating || "New"}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="text-xl font-bold">
                            {restaurant.name}
                          </h3>
                        </div>

                        <p className="mb-5 text-sm leading-6 text-muted-foreground">
                          {restaurant.description}
                        </p>

                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                          <span className="flex items-center gap-2 rounded-2xl bg-background px-3 py-2">
                            <MapPin className="w-4 h-4" />
                            {restaurant.address || "Colombo"}
                          </span>

                          <span className="flex items-center gap-2 rounded-2xl bg-background px-3 py-2">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone || "N/A"}
                          </span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectRestaurant(restaurant)}
                          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          Select Restaurant
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <AnimatePresence>
        {showSelectionModal && selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={closeSelectionModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-1">{selectedRestaurant.name}</h2>
                  <p className="text-muted-foreground text-sm">{selectedRestaurant.description}</p>
                </div>
                <button
                  onClick={closeSelectionModal}
                  disabled={submitting}
                  className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {isConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
                  >
                    <Check className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Selection Confirmed!</p>
                      <p className="text-sm">{successMessage}</p>
                    </div>
                  </motion.div>
                )}

                <div className={`space-y-3 ${isConfirmed ? "p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border border-primary/20" : ""}`}>
                  {isConfirmed && (
                    <p className="text-sm font-semibold text-primary mb-2">Here's how to reach them:</p>
                  )}

                  <a
                    href={selectedRestaurant.locationLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Navigation className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Google Maps</p>
                      <p className="text-sm text-muted-foreground">{selectedRestaurant.address || "View location"}</p>
                    </div>
                    <Globe className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </a>

                  <a
                    href={selectedRestaurant.phone ? `tel:${selectedRestaurant.phone}` : "#"}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{selectedRestaurant.phone || "Not available"}</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border">
                    <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{selectedRestaurant.address || "Address not available"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  {isConfirmed ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFinishSelection}
                      className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Finish
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmSelection}
                        disabled={submitting}
                        className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Confirming...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Confirm Selection
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeSelectionModal}
                        disabled={submitting}
                        className="flex-1 py-4 border border-border rounded-xl font-semibold hover:bg-muted transition-all disabled:opacity-50"
                      >
                        Cancel
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
