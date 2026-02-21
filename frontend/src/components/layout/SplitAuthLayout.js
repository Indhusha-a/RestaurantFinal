import { motion } from "framer-motion";
import FloatingIcons from "../ui/FloatingIcons";
import BusinessMenu from "../ui/BusinessMenu";

export default function SplitAuthLayout({
  children,
  title,
  subtitle,
  showBusiness = true
}) {
  return (
    <div className="min-h-screen flex overflow-hidden bg-background relative">
      {/* Floating Background Icons */}
      <FloatingIcons count={18} />

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden">
        {/* Gradient Background with Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 animate-gradient" />
        
        {/* Animated Food Icons Overlay */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl opacity-20"
              initial={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 40, -20, 20, 0],
                x: [0, 30, -30, 40, -40, 0],
                rotate: [0, 15, -15, 20, -20, 0],
              }}
              transition={{
                duration: 12 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              {["🍕", "🍔", "🍣", "🍜", "🍝", "🥗", "🍦", "🍰"][i]}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center z-10 px-12 text-white"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="w-28 h-28 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-8 shadow-2xl"
          >
            <span className="text-6xl">🍽️</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-display font-bold mb-4"
          >
            iamhungry
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg opacity-90 max-w-md mx-auto"
          >
            Discover restaurants powered by AI-driven craving intelligence.
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 relative flex items-center justify-center px-8 bg-white/50 backdrop-blur-sm">
        {showBusiness && (
          <div className="absolute top-6 left-6 z-20">
            <BusinessMenu />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-4xl font-display font-bold mb-3">
            {title}
          </h2>

          <p className="text-muted-foreground mb-10">
            {subtitle}
          </p>

          {children}
        </motion.div>
      </div>
    </div>
  );
}