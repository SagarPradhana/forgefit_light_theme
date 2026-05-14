import { motion } from "framer-motion";
import clsx from "clsx";

export function Card({ children, className, hover = false, padding = "md", ...props }: any) {
  const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={clsx(
        "rounded-2xl bg-white border border-gold-400/20 shadow-elegant",
        paddings[padding as keyof typeof paddings] || paddings.md,
        hover && "hover:shadow-elegant-lg hover:border-gold-400/40 cursor-pointer transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}