import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const icons = ["🍕", "🍔", "🍣", "🍜", "🍝", "🥗", "🍦", "🍰", "☕", "🍷", "🍺", "🍱", "🥘", "🍛", "🥟"];

export default function FloatingIcons({ count = 10 }) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const newElements = [];
    for (let i = 0; i < count; i++) {
      const icon = icons[Math.floor(Math.random() * icons.length)];
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = 8 + Math.random() * 10;
      const delay = Math.random() * 5;
      const size = 20 + Math.random() * 30;
      
      newElements.push({
        id: i,
        icon,
        left,
        top,
        duration,
        delay,
        size
      });
    }
    setElements(newElements);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute text-4xl opacity-20"
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            fontSize: `${el.size}px`,
          }}
          animate={{
            y: [0, -30, 30, -20, 20, 0],
            x: [0, 20, -20, 30, -30, 0],
            rotate: [0, 10, -10, 15, -15, 0],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}