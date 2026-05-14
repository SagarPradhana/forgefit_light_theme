import { motion } from "framer-motion";
import clsx from "clsx";
import { LoaderSpinner } from "./LoadingStates";
import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";

// ==================== Button Variants ====================
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: ReactNode;
}

// ==================== Button Component ====================
interface ButtonProps extends ButtonBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-[0_4px_15px_var(--glow-orange)] hover:shadow-[0_10px_35px_var(--glow-orange)] hover:-translate-y-0.5",
    secondary: "bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] hover:-translate-y-0.5",
    ghost: "bg-transparent border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-accent)] hover:text-[var(--accent-orange)]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    gold: "bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold)]/80 text-white shadow-[0_4px_15px_rgba(201,146,42,0.3)] hover:shadow-[0_10px_35px_rgba(201,146,42,0.4)] hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
        "border-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "cursor-not-allowed opacity-60",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoaderSpinner size={size === "lg" ? 20 : 16} className="text-white" />
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
}

// ==================== Link Button ====================
interface LinkButtonProps extends ButtonBaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "size"> {
  to: string;
}

export function LinkButton({
  to,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className,
  ...props
}: LinkButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-[0_4px_15px_var(--glow-orange)] hover:shadow-[0_10px_35px_var(--glow-orange)] hover:-translate-y-0.5",
    secondary: "bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] hover:-translate-y-0.5",
    ghost: "bg-transparent border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-accent)] hover:text-[var(--accent-orange)]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    gold: "bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold)]/80 text-white shadow-[0_4px_15px_rgba(201,146,42,0.3)] hover:shadow-[0_10px_35px_rgba(201,146,42,0.4)] hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <motion.div whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
      <Link
        to={to}
        className={clsx(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          loading && "cursor-not-allowed opacity-60 pointer-events-none",
          className
        )}
        {...props}
      >
        {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
        {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
      </Link>
    </motion.div>
  );
}

// ==================== Icon Button ====================
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon: ReactNode;
  label?: string;
}

export function IconButton({
  variant = "ghost",
  size = "md",
  icon,
  label,
  className,
  ...props
}: IconButtonProps) {
  const variants = {
    primary: "bg-[var(--accent-orange)] text-white",
    secondary: "bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]",
    ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)]",
    danger: "bg-red-100 text-red-500 hover:bg-red-200",
  };

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "rounded-xl flex items-center justify-center transition-all duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      title={label}
      {...props}
    >
      {icon}
    </motion.button>
  );
}

// ==================== FAB (Floating Action Button) ====================
interface FABProps {
  icon: ReactNode;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FAB({ icon, onClick, label, className }: FABProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={clsx(
        "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-lg hover:shadow-xl flex items-center justify-center",
        className
      )}
      title={label}
    >
      {icon}
    </motion.button>
  );
}

// ==================== Button Group ====================
interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      {children}
    </div>
  );
}