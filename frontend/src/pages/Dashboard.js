import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Compass, Users, Bell, LogOut, Sparkles, ArrowRight, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingIcons from "../components/ui/FloatingIcons";
import { userAPI } from "../services/api"; // Import API to fetch real name if needed

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

export default function Dashboard() {
  const [notifications, setNotifications] = useState(3);
  const [userName, setUserName] = useState(""); // Removed "John" default
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check for Token (Real Auth Check)
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // 2. Try to get user from LocalStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Handle both "firstName" and "username" depending on what backend sends
        setUserName(parsedUser.firstName || parsedUser.username || "Foodie");
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    } else {
      // 3. Fallback: Fetch profile from API if local storage is empty
      userAPI.getProfile()
        .then(data => {
          setUserName(data.firstName || data.username || "Foodie");
          localStorage.setItem("user", JSON.stringify(data));
        })
        .catch(err => {
          console.error("Failed to fetch profile", err);
          // Only redirect on 401, not 403 (403 might be CORS related)
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login'); // Redirect to login, not root
  };

  const handleModeSelect = (mode) => {
    navigate(mode.route);
  };

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </motion.button>

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
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer"
              >
                <User className="w-5 h-5 text-primary" />
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
            Welcome back, <span className="text-gradient">{userName}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            How would you like to discover restaurants today?
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

        {/* Stats Section with Dummy Data (Connect to API later) */}
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
    </div>
  );
}