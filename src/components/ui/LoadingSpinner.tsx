import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-500 mx-auto mb-6 shadow-gold-lg"
        >
          <div className="absolute inset-2 rounded-2xl bg-white flex items-center justify-center">
            <Dumbbell size={36} className="text-gold-500" />
          </div>
        </motion.div>

        <h3 className="text-xl font-bold text-slate-800 mb-1">Loading</h3>
        <p className="text-sm text-slate-500">Preparing your fitness journey...</p>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              className="h-3 w-3 rounded-full bg-gradient-to-r from-gold-400 to-gold-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
}