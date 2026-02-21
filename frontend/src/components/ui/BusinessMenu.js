import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ChevronDown } from "lucide-react";
import ComingSoonModal from "./ComingSoonModal";

export default function BusinessMenu() {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const handleClick = (title) => {
    setModalTitle(title);
    setOpen(false);
    setTimeout(() => setModalOpen(true), 200);
  };

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
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
            className="absolute left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-float z-50"
          >
            <button
              onClick={() => { setModalTitle("Restaurant Login"); setOpen(false); setModalOpen(true); }}
              className="block w-full text-left px-4 py-3 hover:bg-muted transition"
            >
              Restaurant Login
            </button>
            <button
              onClick={() => { setModalTitle("Restaurant Signup"); setOpen(false); setModalOpen(true); }}
              className="block w-full text-left px-4 py-3 hover:bg-muted transition"
            >
              Restaurant Signup
            </button>
            <button
              onClick={() => { setModalTitle("Admin Login"); setOpen(false); setModalOpen(true); }}
              className="block w-full text-left px-4 py-3 hover:bg-muted transition"
            >
              Admin Login
            </button>
          </motion.div>
        )}
      </div>

      <ComingSoonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
      />
    </>
  );
}
