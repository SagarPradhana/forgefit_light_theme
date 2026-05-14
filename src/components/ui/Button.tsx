import { motion } from "framer-motion";
import clsx from "clsx";

export function Button({ children, className, variant = "primary", size = "md", ...props }: any) {
  const variants = {
    primary: "bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-gold hover:shadow-gold-lg",
    secondary: "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-gold hover:shadow-gold-lg",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md",
    ghost: "bg-white text-slate-700 border border-cream-200 hover:bg-cream-50 hover:border-gold-400/30",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={clsx("rounded-2xl font-semibold transition-all duration-200", variants[variant], sizes[size], className)} {...props}>
      {children}
    </motion.button>
  );
}