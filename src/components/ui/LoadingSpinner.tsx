import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative mx-auto mb-6" style={{ width: 96, height: 96 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--accent-orange)] via-[var(--accent-gold)] to-[var(--accent-orange)]"
            style={{ boxShadow: "0 0 40px var(--glow-orange)" }}
          />
          <motion.div
            animate={{ scale: [1, 0.95, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-2xl bg-white flex items-center justify-center"
          >
            <Dumbbell size={36} className="text-[var(--accent-orange)]" />
          </motion.div>
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">Loading</h3>
        <p className="text-sm text-[var(--text-muted)]">Preparing your fitness journey...</p>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }}
              className="h-3 w-3 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)]"
              style={{ boxShadow: "0 0 8px var(--glow-orange)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}