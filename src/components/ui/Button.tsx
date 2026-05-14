import { motion } from "framer-motion";
import clsx from "clsx";

export function Button({ children, className, variant = "primary", size = "md", ...props }: any) {
  const variants = {
    primary: "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-[0_4px_15px_var(--glow-orange)] hover:shadow-[0_10px_35px_var(--glow-orange)] hover:-translate-y-0.5",
    secondary: "bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] hover:-translate-y-0.5",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
    ghost: "bg-transparent border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-accent)] hover:text-[var(--accent-orange)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }} 
      whileTap={{ scale: 0.98 }} 
      className={clsx(
        "rounded-xl font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2",
        variants[variant], 
        sizes[size], 
        className
      )} 
      {...props}
    >
      {children}
    </motion.button>
  );
}