import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Star, MapPin, Clock, DollarSign, Tag, X, Check, 
  Navigation, Phone, Globe, XCircle, AlertCircle, Loader 
} from "lucide-react";
import { restaurantAPI } from "../services/api";

export default function IndividualMode() {
  const [craving, setCraving] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
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

  const budgets = [
    { value: "0-1000", label: "$ (0-1000)", emoji: "💰" },
    { value: "1000-2000", label: "$$ (1000-2000)", emoji: "💰💰" },
    { value: "2000-5000", label: "$$$ (2000-5000)", emoji: "💰💰💰" },
    { value: "5000+", label: "$$$$ (5000+)", emoji: "💰💰💰💰" },
  ];

  // Demo Fallback Tags to prevent UI crash
  const fallbackTags = [
    { tagId: 1, tagName: 'Cozy Cafe', emoji: '☕' },
    { tagId: 2, tagName: 'Family Friendly', emoji: '👨‍👩‍👧‍👦' },
    { tagId: 3, tagName: 'Romantic', emoji: '❤️' },
    { tagId: 4, tagName: 'Fast Casual', emoji: '🍔' },
    { tagId: 5, tagName: 'Fine Dining', emoji: '🍽️' }
  ];

  useEffect(() => {
    loadTags();
    loadSpecialties();
  }, []);

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const fetchedTags = await restaurantAPI.getTags();
      
      // Ensure we have an array of tags
      if (Array.isArray(fetchedTags) && fetchedTags.length > 0) {
        setTags(fetchedTags);
      } else {
        // Fallback if no tags returned
        setTags(fallbackTags);
      }
    } catch (err) {
      console.error("Failed to load tags from backend. Using fallback.", err);
      // DEMO SAVER: If API fails, provide fallback so UI remains functional
      setTags(fallbackTags);
      setError(""); 
    } finally {
      setLoadingTags(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const fetchedSpecialties = await restaurantAPI.getSpecialties();
      
      // Ensure we have an array of specialties
      if (Array.isArray(fetchedSpecialties)) {
        setSpecialties(fetchedSpecialties);
      }
    } catch (err) {
      console.error("Failed to load specialties:", err);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      if (prev.length < 3) {
        return [...prev, tagId];
      }
      return prev;
    });
  };

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

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowMapModal(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedRestaurant) return;
    
    setSubmitting(true);
    setError("");
    
    try {
      await restaurantAPI.selectRestaurant(selectedRestaurant.restaurantId);
      setSuccessMessage(`Restaurant selected! The owner will confirm your visit.`);
      setIsConfirmed(true);
      // Don't auto-close - let user see contact info and click Finish
    } catch (err) {
      console.error("Selection failed:", err);
      setError(err.message || "Failed to select restaurant. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    setShowMapModal(false);
    setSuccessMessage("");
    setSelectedRestaurant(null);
    setIsConfirmed(false);
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
          What are you <span className="text-gradient">craving</span>?
        </h1>
        <p className="text-lg text-muted-foreground">
          Tell us what you're in the mood for and we'll find the perfect match
        </p>
      </div>

      <div className="bg-card rounded-2xl border-2 border-border/50 shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-foreground">I'm craving...</label>
            <p className="text-sm text-muted-foreground mb-3">Select a cuisine type</p>
            
            {loadingSpecialties ? (
              <div className="flex items-center gap-2 py-4">
                <Loader className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading specialties...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {specialties.map(specialty => (
                  <motion.button
                    key={specialty.specialtyId || specialty.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCraving(specialty.name)}
                    className={`px-4 py-2 rounded-full border-2 transition-all ${
                      craving === specialty.name
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 hover:border-primary/30 bg-white/50'
                    }`}
                    disabled={isSearching}
                  >
                    {specialty.name}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-64">
            <label className="block text-sm font-medium mb-2 text-foreground">Budget</label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
              disabled={isSearching}
            >
              <option value="">Any Budget</option>
              {budgets.map(budget => (
                <option key={budget.value} value={budget.value}>
                  {budget.emoji} {budget.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:w-auto flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={isSearching || loadingSpecialties}
              className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-xl transition-all"
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
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 p-4 border-2 border-border/50 rounded-xl hover:border-primary/50 transition-all"
            disabled={isSearching}
          >
            <Filter className="w-5 h-5" />
            Filters {selectedTags.length > 0 && `(${selectedTags.length})`}
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Vibe (max 3)</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {selectedTags.length}/3 selected
            </span>
          </div>
          
          {loadingTags ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <motion.button
                  key={tag.tagId || tag.tag_id || tag.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTagToggle(tag.tagId || tag.tag_id || tag.id)}
                  className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
                    selectedTags.includes(tag.tagId || tag.tag_id || tag.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 hover:border-primary/30 bg-white/50'
                  } ${selectedTags.length >= 3 && !selectedTags.includes(tag.tagId || tag.tag_id || tag.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={selectedTags.length >= 3 && !selectedTags.includes(tag.tagId || tag.tag_id || tag.id) || isSearching}
                >
                  <span>{tag.emoji || '🏷️'}</span>
                  {tag.tagName || tag.tag_name || tag.name}
                  {selectedTags.includes(tag.tagId || tag.tag_id || tag.id) && (
                    <Check className="w-4 h-4" />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
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
        
        {results.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Found {results.length} restaurant{results.length > 1 ? 's' : ''}
              </h2>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                  disabled={isSearching}
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {results.map((restaurant, index) => (
                <motion.div
                  key={restaurant.restaurantId || restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl border-2 border-border/50 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.image1Path || restaurant.image1_path || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {restaurant.averageRating || restaurant.avg_rating || "New"} ({restaurant.totalRatings || restaurant.review_count || "0"})
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{restaurant.name}</h3>
                      <span className="text-sm font-medium text-primary">
                        {budgets.find(b => b.value === (restaurant.budgetRange || restaurant.budget_range))?.emoji || '💰'}
                      </span>
                    </div>

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
                        {restaurant.phone}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(restaurant.tags || []).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full text-xs flex items-center gap-1"
                        >
                          <span>🏷️</span>
                          {tag}
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
                      View on Maps & Select
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
              <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or try a different craving
              </p>
            </div>
          )
        )}
        
        {isSearching && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Searching for restaurants...</p>
          </div>
        )}
      </div>

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
              className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-1">{selectedRestaurant.name}</h2>
                  <p className="text-muted-foreground">{selectedRestaurant.description}</p>
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
                {/* Success Message after confirmation */}
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

                {/* Contact Info Section - Always visible, highlighted after confirmation */}
                <div className={`space-y-4 ${isConfirmed ? 'p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border-2 border-primary/20' : ''}`}>
                  {isConfirmed && (
                    <p className="text-sm font-semibold text-primary mb-2">Here's how to reach them:</p>
                  )}
                  
                  {/* Google Maps Link */}
                  <a
                    href={selectedRestaurant.locationLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
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

                  {/* Phone Number */}
                  <a
                    href={selectedRestaurant.phone ? `tel:${selectedRestaurant.phone}` : "#"}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
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
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border/50">
                    <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{selectedRestaurant.address || "Address not available"}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  {isConfirmed ? (
                    // After confirmation - show Finish button
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
                    // Before confirmation - show Confirm and Cancel buttons
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
                        className="flex-1 py-4 border-2 border-border/50 rounded-xl font-semibold hover:bg-muted transition-all disabled:opacity-50"
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