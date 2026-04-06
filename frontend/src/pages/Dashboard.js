import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Compass, Users, Bell, LogOut, Sparkles, ArrowRight, ChefHat, Star, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingIcons from "../components/ui/FloatingIcons";
import { userAPI, restaurantAPI } from "../services/api";
import axios from 'axios';

const modes = [
  {
    id: "individual",
    title: "Individual Mode",
    icon: User,
    emoji: "🎯",
    description: "Get personalized picks based on your craving, budget and vibe",
    color: "from-orange-500 to-pink-500",
    features: ["Craving-based search", "Budget filter", "Vibe tags (max 3)", "Personalized results"],
    route: "/dashboard/individual"
  },
  {
    id: "explore",
    title: "Explore Mode",
    icon: Compass,
    emoji: "🌟",
    description: "Discover trending spots, new restaurants, and AI-powered suggestions",
    color: "from-blue-500 to-purple-500",
    features: ["Hot 10 restaurants", "Newly added", "Recommended for you", "Collaborative filtering"],
    route: "/dashboard/explore"
  },
  {
    id: "group",
    title: "Group Mode",
    icon: Users,
    emoji: "👥",
    description: "Plan group outings with friends, vote together, and earn rewards",
    color: "from-green-500 to-teal-500",
    features: ["Create groups", "TOPSIS ranking", "Swipe voting", "Leaderboard points"],
    route: "/dashboard/group"
  }
];

// Renders filled or empty stars for a given rating value (1-5)
function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [notifCount, setNotifCount]       = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [loadingNotifs, setLoadingNotifs]   = useState(false);

  const [userName, setUserName]   = useState("");
  const [userAvatar, setUserAvatar] = useState("neutral");
  const [isNewUser, setIsNewUser]   = useState(false);

  // Visit-rating modal state
  const [showRatingModal, setShowRatingModal]   = useState(false);
  const [ratingVisits, setRatingVisits]         = useState([]);
  const [loadingVisits, setLoadingVisits]       = useState(false);
  const [hoveredStar, setHoveredStar]           = useState({ visitId: null, star: 0 });
  const [submittingRating, setSubmittingRating] = useState(null);
  const [ratedSuccess, setRatedSuccess]         = useState({});

  const navigate = useNavigate();
  const notifRef = useRef(null);

  useEffect(() => {
    // Guard: redirect to login when no token is present
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Load user display name and avatar from local storage or fall back to API
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.firstName || parsedUser.username || "Foodie");
        setUserAvatar(parsedUser.avatarIcon || "neutral");
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    } else {
      userAPI.getProfile()
        .then(data => {
          setUserName(data.firstName || data.username || "Foodie");
          setUserAvatar(data.avatarIcon || "neutral");
          localStorage.setItem("user", JSON.stringify(data));
        })
        .catch(err => {
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }
        });
    }

    // Fetch unread notification count for the badge on the bell icon
    if (token && token !== 'undefined') {
      axios.get('http://localhost:8080/api/users/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setNotifCount(res.data?.count || 0))
        .catch(() => {});
    }

    const newUserFlag = localStorage.getItem('isNewUser');
    if (newUserFlag === 'true') {
      setIsNewUser(true);
      localStorage.removeItem('isNewUser');
    }
  }, [navigate]);

  // Close notification panel when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  };

  const handleModeSelect = (mode) => {
    navigate(mode.route);
  };

  // Pulls full notification messages when the bell is clicked
  const handleBellClick = async () => {
    const next = !showNotifPanel;
    setShowNotifPanel(next);
    if (next && notifications.length === 0) {
      setLoadingNotifs(true);
      try {
        const data = await userAPI.getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoadingNotifs(false);
      }
    }
  };

  // Opens rate-visits modal and loads individual-mode visits that have not been rated yet
  const handleOpenRatingModal = async () => {
    setShowRatingModal(true);
    setLoadingVisits(true);
    try {
      const data = await userAPI.getVisitHistory();
      // Only individual visits are eligible for rating (group visits do not get rated)
      const individual = (Array.isArray(data) ? data : []).filter(v => v.mode === "INDIVIDUAL");
      setRatingVisits(individual);
    } catch {
      setRatingVisits([]);
    } finally {
      setLoadingVisits(false);
    }
  };

  // Submits a one-time rating that is saved in the ratings table and consumed by the CF engine
  const handleSubmitRating = async (restaurantId, visitId, star) => {
    setSubmittingRating(visitId);
    try {
      await restaurantAPI.rateVisit(restaurantId, star);
      // Mark this visit locally so the star row switches to a read-only display
      setRatingVisits(prev =>
        prev.map(v => v.visitId === visitId ? { ...v, ratingGiven: star } : v)
      );
      setRatedSuccess(prev => ({ ...prev, [visitId]: true }));
    } catch (err) {
      console.error("Rating failed:", err);
    } finally {
      setSubmittingRating(null);
    }
  };

  // Avatar emoji lookup matches the same mapping used across Dashboard and Profile
  const avatarEmoji = userAvatar === 'chef' ? '🧑‍🍳'
    : userAvatar === 'happy' ? '😊'
    : userAvatar === 'cool'  ? '😎'
    : userAvatar === 'foodie'? '🍔'
    : '👤';

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <FloatingIcons count={20} />

      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold">
              <span className="text-gradient">iam</span>
              <span className="text-foreground">hungry</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Rate My Visits button — opens the CF rating modal */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenRatingModal}
              id="rate-visits-btn"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-primary/20 hover:border-primary/50 transition-all text-sm font-medium"
            >
              <Star className="w-4 h-4 text-primary" />
              Rate Visits
            </motion.button>

            {/* Notification bell with unread badge and dropdown */}
            <div className="relative" ref={notifRef}>
              <motion.button
                id="notif-bell-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBellClick}
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </motion.button>

              {/* Notification dropdown panel */}
              <AnimatePresence>
                {showNotifPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-float z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <span className="font-semibold text-sm">Notifications</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotifPanel(false)}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {loadingNotifs ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif, i) => (
                          <motion.div
                            key={notif.id || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <p className="text-sm leading-snug">{notif.message}</p>
                            {notif.createdAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>

            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer text-lg"
              >
                {avatarEmoji}
              </motion.div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <ChefHat className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            {isNewUser ? (
              <>Hey there, <span className="text-gradient">{userName}</span>! Let's find your first spot 🍽️</>
            ) : (
              <>Welcome back, <span className="text-gradient">{userName}</span></>
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isNewUser
              ? "Pick a mode below to start discovering amazing restaurants!"
              : "How would you like to discover restaurants today?"
            }
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {modes.map((mode, index) => {
            const Icon = mode.icon;

            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="relative bg-card border border-border rounded-3xl p-8 h-full hover:shadow-2xl transition-all duration-300">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mode.color} bg-opacity-10 flex items-center justify-center mb-6`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <h2 className="text-2xl font-display font-bold mb-3">
                    {mode.title}
                  </h2>

                  <p className="text-muted-foreground mb-6">
                    {mode.description}
                  </p>

                  <ul className="space-y-2 mb-8">
                    {mode.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + i * 0.05 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Sparkles className="w-4 h-4 text-primary" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModeSelect(mode)}
                    className={`w-full py-4 rounded-xl bg-gradient-to-r ${mode.color} text-white font-semibold shadow-lg flex items-center justify-center gap-2 group-hover:shadow-xl transition-all`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <div className="absolute top-6 right-6 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {mode.emoji}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 p-8 bg-muted/30 rounded-2xl"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-sm text-muted-foreground">Restaurants Visited</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-sm text-muted-foreground">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-sm text-muted-foreground">Group Sessions</div>
          </div>
        </motion.div>
      </main>

      {/* ==================== RATING MODAL ==================== */}
      {/* Shows individual-mode visits; unrated ones display a clickable star selector.
          Each submitted rating is written to the ratings table and feeds the CF engine. */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col border-2 border-border/50 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-display font-bold">Rate Your Visits</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your ratings help us recommend better restaurants for you
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRatingModal(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Visit list */}
              <div className="flex-1 overflow-y-auto">
                {loadingVisits ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : ratingVisits.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No individual visits yet</p>
                    <p className="text-sm mt-1">Use Individual Mode to visit restaurants first</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {ratingVisits.map(visit => {
                      const alreadyRated = visit.ratingGiven != null;
                      const justRated    = ratedSuccess[visit.visitId];
                      const isSubmitting = submittingRating === visit.visitId;

                      return (
                        <motion.div
                          key={visit.visitId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="px-6 py-4"
                        >
                          <div className="flex flex-col gap-2">
                            {/* Restaurant name and visit date */}
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{visit.restaurantName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {visit.visitDate
                                    ? new Date(visit.visitDate).toLocaleDateString("en-GB", {
                                        day: "numeric", month: "short", year: "numeric"
                                      })
                                    : "Date unknown"}
                                </p>
                              </div>

                              {/* Confirmation badge when rating was just submitted */}
                              {justRated && (
                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Submitted
                                </span>
                              )}
                            </div>

                            {/* Star selector (unrated) or read-only display (rated) */}
                            {alreadyRated ? (
                              <div className="flex items-center gap-2">
                                <StarDisplay value={visit.ratingGiven} />
                                <span className="text-xs text-muted-foreground">Your rating</span>
                              </div>
                            ) : isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-muted-foreground">Saving...</span>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => {
                                  const isHovered = hoveredStar.visitId === visit.visitId && star <= hoveredStar.star;
                                  return (
                                    <motion.button
                                      key={star}
                                      id={`star-${visit.visitId}-${star}`}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                      onMouseEnter={() => setHoveredStar({ visitId: visit.visitId, star })}
                                      onMouseLeave={() => setHoveredStar({ visitId: null, star: 0 })}
                                      onClick={() => handleSubmitRating(visit.restaurantId, visit.visitId, star)}
                                      className="focus:outline-none"
                                    >
                                      <Star
                                        className={`w-6 h-6 transition-colors ${
                                          isHovered
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-border hover:text-yellow-300"
                                        }`}
                                      />
                                    </motion.button>
                                  );
                                })}
                                <span className="text-xs text-muted-foreground self-center ml-1">
                                  Tap to rate
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}