import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">
          🍽 iamhungry
        </h2>

        <div className="flex items-center gap-6">
          <Link to="/login" className="font-medium text-gray-700 hover:text-primary transition">
            Sign In
          </Link>

          <Link to="/register">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition">
              Get Started →
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
