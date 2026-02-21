import { motion, AnimatePresence } from "framer-motion";

export default function ComingSoonModal({ open, onClose, title }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="bg-card p-10 rounded-3xl shadow-float text-center max-w-md w-full border border-border">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-2xl font-display font-bold mb-2">
                {title}
              </h3>
              <p className="text-gray-500 mb-6">
                This feature will be implemented in the next module.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-glow"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
