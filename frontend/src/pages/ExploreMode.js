import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ExploreMode() {
  return (
    <div className="text-center py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6"
      >
        <Sparkles className="w-12 h-12 text-primary" />
      </motion.div>
      <h2 className="text-3xl font-display font-bold mb-4">Explore Mode</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Discover trending restaurants and AI-powered recommendations coming soon!
      </p>
    </div>
  );
}