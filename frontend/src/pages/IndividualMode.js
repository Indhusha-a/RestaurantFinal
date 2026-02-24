import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, MapPin, Tag, X, Check,
  Navigation, Phone, Globe, XCircle, AlertCircle, Loader, ArrowLeft
} from "lucide-react";
import { restaurantAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import FloatingIcons from "../components/ui/FloatingIcons";

export default function IndividualMode() {
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [craving, setCraving] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Budget options as selectable pill buttons
  const budgets = [
    { value: "0-1000", label: "0 - 1,000", emoji: "💰" },
    { value: "1000-2000", label: "1,000 - 2,000", emoji: "💰💰" },
    { value: "2000-5000", label: "2,000 - 5,000", emoji: "💰💰💰" },
    { value: "5000+", label: "5,000+", emoji: "💰💰💰💰" },
  ];

  // ==================== FALLBACK DATA ====================
  // Used when backend specialties/tags aren't populated yet
  // These match the 10 mains + 5 desserts from restaurant registration

  const fallbackSpecialties = [
    // 10 Main Dishes — these are the fixed craving categories
    { id: 1, name: "Pizza", emoji: "🍕" },
    { id: 2, name: "Burger", emoji: "🍔" },
    { id: 3, name: "Kottu", emoji: "🥘" },
    { id: 4, name: "Fried Rice", emoji: "🍚" },
    { id: 5, name: "Pasta", emoji: "🍝" },
    { id: 6, name: "Biryani", emoji: "🍛" },
    { id: 7, name: "Sushi", emoji: "🍣" },
    { id: 8, name: "Noodles", emoji: "🍜" },
    { id: 9, name: "Submarine", emoji: "🥖" },
    { id: 10, name: "Shawarma", emoji: "🌯" },
    // 5 Desserts
    { id: 11, name: "Ice Cream", emoji: "🍦" },
    { id: 12, name: "Cake", emoji: "🍰" },
    { id: 13, name: "Waffles", emoji: "🧇" },
    { id: 14, name: "Brownies", emoji: "🍫" },
    { id: 15, name: "Pancakes", emoji: "🥞" },
  ];

  const fallbackTags = [
    { id: 1, tagName: 'Cozy Cafe', emoji: '☕' },
    { id: 2, tagName: 'Family Friendly', emoji: '👨‍👩‍👧‍👦' },
    { id: 3, tagName: 'Romantic', emoji: '❤️' },
    { id: 4, tagName: 'Fast Casual', emoji: '🍔' },
    { id: 5, tagName: 'Fine Dining', emoji: '🍽️' },
    { id: 6, tagName: 'Street Food', emoji: '🌮' },
    { id: 7, tagName: 'Rooftop', emoji: '🌃' },
    { id: 8, tagName: 'Buffet', emoji: '🍱' },
    { id: 9, tagName: 'Outdoor Seating', emoji: '🌿' },
    { id: 10, tagName: 'Live Music', emoji: '🎵' }
  ];

  // ==================== LOAD DATA ON MOUNT ====================

  useEffect(() => {
    loadTags();
    loadSpecialties();
  }, []);

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const fetchedTags = await restaurantAPI.getTags();
      if (Array.isArray(fetchedTags) && fetchedTags.length > 0) {
        setTags(fetchedTags);
      } else {
        setTags(fallbackTags);
      }
    } catch (err) {
      console.error("Failed to load tags, using fallback", err);
      setTags(fallbackTags);
    } finally {
      setLoadingTags(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const fetchedSpecialties = await restaurantAPI.getSpecialties();
      // Use backend specialties if available, otherwise use fallback set
      if (Array.isArray(fetchedSpecialties) && fetchedSpecialties.length > 0) {
        setSpecialties(fetchedSpecialties);
      } else {
        setSpecialties(fallbackSpecialties);
      }
    } catch (err) {
      console.error("Failed to load specialties, using fallback", err);
      setSpecialties(fallbackSpecialties);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  // ==================== INDIVIDUAL MODE HANDLERS ====================

  // Toggle a vibe tag selection (max 3)
  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) return prev.filter(id => id !== tagId);
      if (prev.length < 3) return [...prev, tagId];
      return prev;
    });
  };

  // Get property from tag/specialty objects (handles different backend naming)
  const getTagId = (tag) => tag.id || tag.tagId || tag.tag_id;
  const getTagName = (tag) => tag.tagName || tag.tag_name || tag.name;
  const getSpecialtyName = (spec) => spec.name || spec.specialtyName;

  // Send filter request to backend
  const handleSearch = async () => {
    setIsSearching(true);
    setError("");
    setResults([]);

    try {
      const filterData = {
        craving: craving || null,
        budgetRange: selectedBudget || null,
        tagIds: selectedTags.length > 0 ? selectedTags : null
      };

      const response = await restaurantAPI.filterRestaurants(filterData);
      const data = Array.isArray(response) ? response : (response.data || []);
      setResults(data);

      if (data.length === 0) {
        setError("No restaurants found. Try adjusting your filters.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || "Failed to search restaurants. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Open restaurant details modal
  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowMapModal(true);
  };

  // Confirm restaurant selection — records visit and sends notification
  const handleConfirmSelection = async () => {
    if (!selectedRestaurant) return;
    setSubmitting(true);
    setError("");

    try {
      await restaurantAPI.selectRestaurant(selectedRestaurant.restaurantId);
      setSuccessMessage("Restaurant selected! The owner will confirm your visit.");
      setIsConfirmed(true);
    } catch (err) {
      console.error("Selection failed:", err);
      setError(err.message || "Failed to select restaurant. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Finish individual mode flow
  const handleFinish = () => {
    setShowMapModal(false);
    setSuccessMessage("");
    setSelectedRestaurant(null);
    setIsConfirmed(false);
  };

  // Reset all filters
  const handleClearAll = () => {
    setCraving("");
    setSelectedBudget("");
    setSelectedTags([]);
    setResults([]);
    setError("");
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">

      {/* Floating food icons background — same as Dashboard */}
      <FloatingIcons count={15} />

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">

        {/* Header with back button */}
        <div className="mb-8 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-1">
              Individual <span className="text-gradient">Mode</span>
            </h1>
            <p className="text-muted-foreground">
              Find your perfect restaurant match
            </p>
          </div>
        </div>

        {/* ==================== FILTER CARD ==================== */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6 mb-8 space-y-6">

          {/* Step 1: Craving — select from specialty tags (10 mains + 5 desserts) */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center">1</span>
              <h3 className="font-semibold text-lg">What are you craving?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 ml-9">Pick a dish you're in the mood for</p>

            {loadingSpecialties ? (
              <div className="flex items-center gap-2 py-4 ml-9">
                <Loader className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading cravings...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 ml-9">
                {specialties.map(specialty => (
                  <motion.button
                    key={specialty.id || specialty.specialtyId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCraving(prev => prev === getSpecialtyName(specialty) ? "" : getSpecialtyName(specialty))}
                    className={`px-4 py-2 rounded-full border-2 transition-all text-sm flex items-center gap-1.5 ${craving === getSpecialtyName(specialty)
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/30'
                      }`}
                    disabled={isSearching}
                  >
                    <span>{specialty.emoji || '🍽️'}</span>
                    {getSpecialtyName(specialty)}
                    {craving === getSpecialtyName(specialty) && <Check className="w-3 h-3 ml-0.5" />}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Step 2: Budget — pill buttons */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center">2</span>
              <h3 className="font-semibold text-lg">Your Budget</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 ml-9">How much are you looking to spend?</p>

            <div className="flex flex-wrap gap-2 ml-9">
              {budgets.map(budget => (
                <motion.button
                  key={budget.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBudget(prev => prev === budget.value ? "" : budget.value)}
                  className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${selectedBudget === budget.value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/30'
                    }`}
                  disabled={isSearching}
                >
                  {budget.emoji} {budget.label}
                  {selectedBudget === budget.value && <Check className="w-3 h-3 ml-1 inline" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Step 3: Vibe tags — max 3 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center">3</span>
              <h3 className="font-semibold text-lg">Preferred Vibe</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {selectedTags.length}/3 selected
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 ml-9">What kind of atmosphere do you prefer?</p>

            {loadingTags ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 ml-9">
                {tags.map(tag => {
                  const tagId = getTagId(tag);
                  const isSelected = selectedTags.includes(tagId);
                  const isDisabled = selectedTags.length >= 3 && !isSelected;
                  return (
                    <motion.button
                      key={tagId}
                      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                      onClick={() => handleTagToggle(tagId)}
                      className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-1.5 text-sm ${isSelected
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : isDisabled
                            ? 'border-border opacity-40 cursor-not-allowed'
                            : 'border-border hover:border-primary/30'
                        }`}
                      disabled={isDisabled || isSearching}
                    >
                      <span>{tag.emoji || '🏷️'}</span>
                      {getTagName(tag)}
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search and Clear buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={isSearching || loadingSpecialties}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-xl transition-all"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Find Restaurants
                </>
              )}
            </motion.button>

            {(craving || selectedBudget || selectedTags.length > 0) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearAll}
                disabled={isSearching}
                className="px-6 py-4 border-2 border-border rounded-xl font-medium hover:bg-muted transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </motion.button>
            )}
          </div>
        </div>

        {/* ==================== RESULTS SECTION ==================== */}

        <div className="space-y-4">
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
            >
              <Check className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </motion.div>
          )}

          {/* Restaurant result cards */}
          {results.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Found {results.length} restaurant{results.length > 1 ? 's' : ''}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {results.map((restaurant, index) => (
                  <motion.div
                    key={restaurant.restaurantId || restaurant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-card/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    {/* Restaurant image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={restaurant.image1Path || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {restaurant.averageRating || "New"} ({restaurant.totalRatings || 0})
                      </div>
                    </div>

                    {/* Restaurant details */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">{restaurant.name}</h3>
                        <span className="text-sm font-medium text-primary">
                          {budgets.find(b => b.value === restaurant.budgetRange)?.emoji || '💰'}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {restaurant.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {restaurant.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {restaurant.address}
                          </span>
                        )}
                        {restaurant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {restaurant.phone}
                          </span>
                        )}
                      </div>

                      {/* Tags display */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(restaurant.tags || []).map((tagName, i) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-full text-xs">
                            🏷️ {tagName}
                          </span>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectRestaurant(restaurant)}
                        disabled={isSearching}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Navigation className="w-4 h-4" />
                        Select Restaurant
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            !isSearching && !error && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to discover</h3>
                <p className="text-muted-foreground">
                  Select your craving, budget and vibe, then hit search
                </p>
              </div>
            )
          )}

          {/* Loading spinner */}
          {isSearching && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">Searching for restaurants...</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== RESTAURANT SELECTION MODAL ==================== */}

      <AnimatePresence>
        {showMapModal && selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !submitting && setShowMapModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="p-6 border-b border-border flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-1">{selectedRestaurant.name}</h2>
                  <p className="text-muted-foreground text-sm">{selectedRestaurant.description}</p>
                </div>
                <button
                  onClick={() => !submitting && setShowMapModal(false)}
                  disabled={submitting}
                  className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Confirmation success */}
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

                {/* Contact info — highlighted after confirmation */}
                <div className={`space-y-3 ${isConfirmed ? 'p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border border-primary/20' : ''}`}>
                  {isConfirmed && (
                    <p className="text-sm font-semibold text-primary mb-2">Here's how to reach them:</p>
                  )}

                  {/* Google Maps Link */}
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

                  {/* Phone */}
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

                  {/* Address */}
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

                {/* Action buttons */}
                <div className="flex gap-3 mt-6">
                  {isConfirmed ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFinish}
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
                        onClick={() => setShowMapModal(false)}
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