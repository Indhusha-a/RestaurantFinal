import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusinessMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card shadow-sm hover:bg-muted transition"
      >
        <Briefcase className="w-4 h-4" />
        Business
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-float z-50"
        >
          <button
            onClick={() => {
              setOpen(false);
              navigate("/restaurant-login");
            }}
            className="block w-full text-left px-4 py-3 hover:bg-muted transition"
          >
            Restaurant Login
          </button>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/restaurant-register");
            }}
            className="block w-full text-left px-4 py-3 hover:bg-muted transition"
          >
            Restaurant Registration
          </button>

        </motion.div>
      )}
    </div>
  );
}
