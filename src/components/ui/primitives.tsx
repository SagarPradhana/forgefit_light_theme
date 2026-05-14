import { motion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { createPortal } from "react-dom";

export function GlassCard({ className, children, style, ...props }: import("framer-motion").HTMLMotionProps<"div">) {
  return (
    <motion.div 
      className={clsx(
        "rounded-2xl border p-4 md:p-6 bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-accent)]", 
        className
      )} 
      style={{ ...style }} 
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlowButton({ children, className, variant = "primary", ...props }: import("framer-motion").HTMLMotionProps<"button"> & { variant?: "primary" | "secondary"; }) {
  const variants = {
    primary: "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-[0_4px_15px_var(--glow-orange)] hover:shadow-[0_10px_35px_var(--glow-orange)] hover:-translate-y-0.5",
    secondary: "bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]",
  };
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }} 
      whileTap={{ scale: 0.98 }} 
      className={clsx(
        "rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60",
        variants[variant], 
        className
      )} 
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function CommonButton({ children, className, variant = "primary", ...props }: import("framer-motion").HTMLMotionProps<"button"> & { variant?: "primary" | "secondary" | "ghost" | "danger"; }) {
  const styles = {
    primary: "border-none bg-gradient-to-r from-[#e8521a] to-[#c9922a] text-white shadow-[0_4px_15px_rgba(232,82,26,0.25)] hover:shadow-[0_10px_35px_rgba(232,82,26,0.35)] hover:-translate-y-0.5",
    secondary: "bg-white border border-amber-200 text-gray-700 hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]",
    ghost: "bg-white border border-amber-200 text-gray-600 hover:bg-orange-50 hover:border-amber-300 hover:text-gray-800",
    danger: "border-none bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
  };
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }} 
      whileTap={{ scale: 0.98 }} 
      className={clsx(
        "rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60",
        styles[variant], 
        className
      )} 
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function StatusBadge({ status }: { status: "Active" | "Expired" | "Pending" | "Paid" | "Resolved"; }) {
  const { t } = useTranslation();
  const styles = { 
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200", 
    Expired: "bg-red-50 text-red-700 border-red-200", 
    Pending: "bg-amber-50 text-amber-700 border-amber-200", 
    Paid: "bg-blue-50 text-blue-700 border-blue-200", 
    Resolved: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]" 
  };
  return <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", styles[status])}>{t(status.toLowerCase()) || status}</span>;
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info"; }) {
  const variants = { 
    default: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]", 
    success: "bg-emerald-50 text-emerald-700 border-emerald-200", 
    warning: "bg-amber-50 text-amber-700 border-amber-200", 
    danger: "bg-red-50 text-red-700 border-red-200", 
    info: "bg-blue-50 text-blue-700 border-blue-200" 
  };
  return <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border", variants[variant])}>{children}</span>;
}

export function SearchInput({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string; }) {
  return (
    <div className={clsx("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder || "Search..."} 
        className="w-full pl-11 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)] transition-all" 
      />
    </div>
  );
}

export function Dropdown({ value, onChange, options, placeholder, className }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string; className?: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={clsx("relative", className)}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)] transition-all"
      >
        <span>{placeholder || "Select..."}</span>
        <ChevronDown className={clsx("w-4 h-4 text-[var(--text-muted)] transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-hover)] overflow-hidden">
          {options.map((option) => (
            <button 
              key={option.value} 
              type="button" 
              onClick={() => { onChange(option.value); setIsOpen(false); }} 
              className="w-full px-4 py-3 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)] transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1} 
        className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>
      {pages.map((page) => (
        <button 
          key={page} 
          onClick={() => onPageChange(page)} 
          className={clsx(
            "px-3 py-2 text-sm font-medium rounded-xl transition-all",
            page === currentPage 
              ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-[0_4px_15px_var(--glow-orange)]" 
              : "text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)]"
          )}
        >
          {page}
        </button>
      ))}
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages} 
        className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return <div className={clsx("animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent-orange)]", sizes[size])} />;
}

export function NotFound404() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] p-4">
      <div className="text-center">
        <h1 className="text-[120px] font-bold text-[var(--border-subtle)] leading-none">404</h1>
        <p className="text-2xl font-semibold text-[var(--text-primary)] mt-4">{t("pageNotFound") || "Page Not Found"}</p>
        <p className="text-[var(--text-muted)] mt-2">{t("pageNotFoundDesc") || "The page you're looking for doesn't exist."}</p>
        <a href="/" className="inline-flex items-center px-8 py-4 mt-8 bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white rounded-2xl font-semibold shadow-[0_4px_15px_var(--glow-orange)] hover:shadow-[0_10px_35px_var(--glow-orange)] hover:-translate-y-0.5 transition-all">
          {t("goHome") || "Go Home"}
        </a>
      </div>
    </div>
  );
}

export function NoDataFound({ title, description, action }: { title?: string; description?: string; action?: ReactNode; }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-28 h-28 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card-hover)] rounded-full flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-[var(--accent-gold)]" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title || "No data found"}</h3>
      <p className="text-sm text-[var(--text-muted)] mt-2 text-center max-w-md">{description || "There are no records to display at this time."}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, hint, action }: { icon?: React.ElementType; title: string; description?: string; hint?: string; action?: ReactNode; }) {
  const finalDescription = hint ?? description;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-orange)]/10 to-[var(--accent-gold)]/10 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-10 h-10 text-[var(--accent-orange)]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {finalDescription && <p className="text-sm text-[var(--text-muted)] mt-2 text-center max-w-sm">{finalDescription}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string; }) {
  return <div className={clsx("animate-pulse bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--bg-secondary)] bg-[length:200%_100%] rounded-xl shimmer", className)} />;
}

export function Card({ children, className, hover = false, onClick }: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void; }) {
  return (
    <div 
      onClick={onClick} 
      className={clsx(
        "bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-card)] transition-all duration-300", 
        hover && "hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-accent)] cursor-pointer hover:-translate-y-1", 
        className
      )}
    >
      {children}
    </div>
  );
}

export function Modal({
  isOpen,
  open,
  onClose,
  title,
  children,
  footer,
  size = "md"
}: {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const isModalOpen = open ?? isOpen;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);
  if (!isModalOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className={clsx(
          "relative w-full bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-subtle)]",
          sizes[size]
        )}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2.5 text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 bg-[var(--bg-card)] overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex justify-end gap-3">
            {footer}
          </div>
        )}
        {/* Bottom accent line */}
        <div className="h-1 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-gold)] to-[var(--accent-orange)]" />
      </motion.div>
    </div>,
    document.body,
  );
}

export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string }[]; activeTab: string; onChange: (id: string) => void; }) {
  return (
    <div className="flex gap-1 p-1.5 bg-[var(--bg-secondary)] rounded-2xl">
      {tabs.map((tab) => (
        <button 
          key={tab.id} 
          onClick={() => onChange(tab.id)} 
          className={clsx(
            "px-5 py-2.5 text-sm font-semibold rounded-xl transition-all",
            activeTab === tab.id 
              ? "bg-[var(--bg-card)] text-[var(--accent-orange)] shadow-[var(--shadow-card)]" 
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (enabled: boolean) => void; label?: string; }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button 
        type="button" 
        onClick={() => onChange(!enabled)} 
        className={clsx(
          "relative w-12 h-7 rounded-full transition-all",
          enabled 
            ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] shadow-[0_4px_15px_var(--glow-orange)]" 
            : "bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
        )}
      >
        <span 
          className={clsx(
            "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
            enabled && "translate-x-5"
          )} 
        />
      </button>
      {label && <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>}
    </label>
  );
}

export function Avatar({ src, alt, size = "md", fallback }: { src?: string; alt?: string; size?: "sm" | "md" | "lg"; fallback?: string; }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };
  const [error, setError] = useState(false);
  if (src && !error) return <img src={src} alt={alt} onError={() => setError(true)} className={clsx("rounded-full object-cover bg-[var(--bg-secondary)]", sizes[size])} />;
  return (
    <div className={clsx("rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center", sizes[size])}>
      <span className="font-semibold text-white">{fallback || alt?.charAt(0).toUpperCase() || "?"}</span>
    </div>
  );
}

export function Divider({ label }: { label?: string; }) {
  if (label) return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--accent-orange)]/30 to-transparent" />
      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--accent-orange)]/30 to-transparent" />
    </div>
  );
  return <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent" />;
}

// Re-export enhanced Table from common components
export { Table } from "../common/Table";

// Page Header
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode; }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, trendLabel }: { title: string; value: string | number; icon?: React.ElementType; trend?: "up" | "down"; trendLabel?: string; }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-accent)] transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {trendLabel && (
            <p className={clsx("text-xs font-semibold mt-2", trend === "up" ? "text-emerald-600" : "text-red-500")}>
              {trend === "up" ? "↑" : "↓"} {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3.5 bg-gradient-to-br from-[var(--accent-orange)]/10 to-[var(--accent-gold)]/10 rounded-2xl">
            <Icon className="w-6 h-6 text-[var(--accent-orange)]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionTitle({ title, subtitle, children, className }: { title?: string; subtitle?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={clsx("mb-6", className)}>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">{title || children}</h2>
      {subtitle && <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function CommonCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx(
      "bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-accent)] transition-all", 
      className
    )}>
      {children}
    </div>
  );
}

export function InputField({ label, type = "text", value, onChange, placeholder, error, className }: { label?: string; type?: string; value: string; onChange: (value: string) => void; placeholder?: string; error?: string; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">{label}</label>}
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className={clsx(
          "w-full px-4 py-3 bg-[var(--bg-card)] border rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all",
          error 
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" 
            : "border-[var(--border-subtle)] focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)]"
        )} 
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function ButtonLoader({ label, loadingLabel, loading, className, spinnerClassName }: {
  label?: string; loadingLabel?: string; loading?: boolean; className?: string; spinnerClassName?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className={clsx("w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin", spinnerClassName)} />
        {loadingLabel && <span>{loadingLabel}</span>}
      </div>
    );
  }
  return <>{label}</>;
}

export function InlineSpinner({ className }: { className?: string }) {
  return <div className={clsx("w-4 h-4 border-2 border-[var(--border-subtle)] border-t-[var(--accent-orange)] rounded-full animate-spin", className)} />;
}

export function SkeletonRows({ count = 5, n }: { count?: number; n?: number }) {
  const finalCount = n ?? count;
  return (
    <div className="space-y-3">
      {Array.from({ length: finalCount }).map((_, i) => (
        <div 
          key={i} 
          className="h-14 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--bg-secondary)] bg-[length:200%_100%] rounded-xl shimmer" 
        />
      ))}
    </div>
  );
}

export function LoadingOverlay({ show, message }: { show?: boolean; message?: string }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 bg-[var(--bg-card)]/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--border-subtle)] border-t-[var(--accent-orange)] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-[var(--text-muted)]">{message || "Loading..."}</p>
      </div>
    </div>
  );
}