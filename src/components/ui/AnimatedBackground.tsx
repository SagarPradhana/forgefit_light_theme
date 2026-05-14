import { motion } from "framer-motion";

export const themeStyles = {
  elegant: {
    label: "Elegant Pearl",
    primary: "from-accent-indigo to-accent-violet",
    accent: "#d4a853",
  },
  rose: {
    label: "Rose Gold",
    primary: "from-rose-400 to-pink-500",
    accent: "#e8c4b8",
  },
  sage: {
    label: "Sage Luxury",
    primary: "from-emerald-400 to-teal-500",
    accent: "#10b981",
  },
  violet: {
    label: "Violet Royale",
    primary: "from-violet-500 to-purple-600",
    accent: "#8b5cf6",
  },
  gold: {
    label: "Golden Luxe",
    primary: "from-amber-400 to-yellow-500",
    accent: "#f59e0b",
  },
};

export function AnimatedBackground({ colorTheme = "elegant" }: { colorTheme?: keyof typeof themeStyles }) {
  const theme = themeStyles[colorTheme as keyof typeof themeStyles] || themeStyles.elegant;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-cream-50 via-pearl-100 to-rose-50">
      <div className="absolute inset-0 filter blur-[100px] opacity-30">
        <motion.div
          animate={{ x: [0, 100, -50, 0], y: [0, 50, 80, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full"
          style={{ background: `radial-gradient(circle, ${theme.accent}33 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{ x: [0, -80, 60, 0], y: [0, -60, -40, 0], scale: [1, 1.3, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 3 }}
          className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full"
          style={{ background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)` }}
        />
      </div>

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-500"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>
    </div>
  );
}