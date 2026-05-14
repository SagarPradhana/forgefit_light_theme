import { motion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { createPortal } from "react-dom";

export function GlassCard({ className, children, style, ...props }: import("framer-motion").HTMLMotionProps<"div">) {
  return (
    <motion.div className={clsx("rounded-2xl border border-gold-400/20 p-4 md:p-6 bg-white shadow-elegant transition-all duration-300", className)} style={{ ...style }} {...props}>
      {children}
    </motion.div>
  );
}

export function GlowButton({ children, className, variant = "primary", ...props }: import("framer-motion").HTMLMotionProps<"button"> & { variant?: "primary" | "secondary"; }) {
  const variants = {
    primary: "border-gold-400/30 bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-gold hover:shadow-gold-lg",
    secondary: "border-amber-300/30 bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md",
  };
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={clsx("rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60", variants[variant], className)} {...props}>
      {children}
    </motion.button>
  );
}

export function CommonButton({ children, className, variant = "primary", ...props }: import("framer-motion").HTMLMotionProps<"button"> & { variant?: "primary" | "secondary" | "ghost" | "danger"; }) {
  const styles = {
    primary: "border-none bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-gold hover:shadow-gold-lg",
    secondary: "border-none bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-gold hover:shadow-gold-lg",
    ghost: "border border-cream-200 bg-white text-slate-700 hover:bg-cream-50 hover:border-gold-400/30",
    danger: "border-none bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg",
  };
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={clsx("rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60", styles[variant], className)} {...props}>
      {children}
    </motion.button>
  );
}

export function StatusBadge({ status }: { status: "Active" | "Expired" | "Pending" | "Paid" | "Resolved"; }) {
  const { t } = useTranslation();
  const styles = { Active: "bg-emerald-50 text-emerald-700 border-emerald-200", Expired: "bg-red-50 text-red-700 border-red-200", Pending: "bg-amber-50 text-amber-700 border-amber-200", Paid: "bg-blue-50 text-blue-700 border-blue-200", Resolved: "bg-slate-50 text-slate-700 border-slate-200" };
  return <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", styles[status])}>{t(status.toLowerCase()) || status}</span>;
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info"; }) {
  const variants = { default: "bg-slate-50 text-slate-700 border-slate-200", success: "bg-emerald-50 text-emerald-700 border-emerald-200", warning: "bg-amber-50 text-amber-700 border-amber-200", danger: "bg-red-50 text-red-700 border-red-200", info: "bg-blue-50 text-blue-700 border-blue-200" };
  return <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border", variants[variant])}>{children}</span>;
}

export function SearchInput({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string; }) {
  return (
    <div className={clsx("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Search..."} className="w-full pl-11 pr-4 py-3 bg-white border border-cream-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/10 transition-all" />
    </div>
  );
}

export function Dropdown({ value, onChange, options, placeholder, className }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string; className?: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={clsx("relative", className)}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-cream-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/10 transition-all">
        <span>{placeholder || "Select..."}</span>
        <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className="absolute z-50 w-full mt-2 bg-white border border-cream-200 rounded-xl shadow-elegant-lg overflow-hidden">{options.map((option) => <button key={option.value} type="button" onClick={() => { onChange(option.value); setIsOpen(false); }} className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-cream-50 transition-colors">{option.label}</button>)}</div>}
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-cream-200 rounded-xl hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Prev</button>
      {pages.map((page) => <button key={page} onClick={() => onPageChange(page)} className={clsx("px-3 py-2 text-sm font-medium rounded-xl transition-colors", page === currentPage ? "bg-gradient-to-r from-accent-indigo to-accent-violet text-white" : "text-slate-600 bg-white border border-cream-200 hover:bg-cream-50")}>{page}</button>)}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-cream-200 rounded-xl hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return <div className={clsx("animate-spin rounded-full border-2 border-gold-200 border-t-gold-500", sizes[size])} />;
}

export function NotFound404() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cream-50 to-rose-50 p-4">
      <div className="text-center">
        <h1 className="text-[120px] font-bold text-cream-200 leading-none">404</h1>
        <p className="text-2xl font-semibold text-slate-800 mt-4">{t("pageNotFound") || "Page Not Found"}</p>
        <p className="text-slate-500 mt-2">{t("pageNotFoundDesc") || "The page you're looking for doesn't exist."}</p>
        <a href="/" className="inline-flex items-center px-8 py-4 mt-8 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-2xl font-semibold shadow-gold hover:shadow-gold-lg transition-all">{t("goHome") || "Go Home"}</a>
      </div>
    </div>
  );
}

export function NoDataFound({ title, description, action }: { title?: string; description?: string; action?: ReactNode; }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-28 h-28 bg-gradient-to-br from-cream-100 to-rose-100 rounded-full flex items-center justify-center mb-6"><Search className="w-12 h-12 text-gold-400" /></div>
      <h3 className="text-xl font-semibold text-slate-800">{title || "No data found"}</h3>
      <p className="text-sm text-slate-500 mt-2 text-center max-w-md">{description || "There are no records to display at this time."}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon?: React.ElementType; title: string; description?: string; action?: ReactNode; }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && <div className="w-20 h-20 bg-gradient-to-br from-accent-indigo/10 to-accent-violet/10 rounded-2xl flex items-center justify-center mb-4"><Icon className="w-10 h-10 text-accent-indigo" /></div>}
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string; }) {
  return <div className={clsx("animate-pulse bg-gradient-to-r from-cream-100 via-cream-50 to-cream-100 bg-[length:200%_100%] shimmer-gold rounded-xl", className)} />;
}

export function Card({ children, className, hover = false, onClick }: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void; }) {
  return <div onClick={onClick} className={clsx("bg-white rounded-2xl border border-gold-400/20 p-6 shadow-elegant transition-all duration-300", hover && "hover:shadow-elegant-lg hover:border-gold-400/40 cursor-pointer", className)}>{children}</div>;
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={clsx("relative w-full bg-white rounded-3xl shadow-elegant-lg overflow-hidden", sizes[size])}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-cream-50 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-cream-200 bg-cream-50/30 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string }[]; activeTab: string; onChange: (id: string) => void; }) {
  return (
    <div className="flex gap-1 p-1.5 bg-cream-100 rounded-2xl">
      {tabs.map((tab) => <button key={tab.id} onClick={() => onChange(tab.id)} className={clsx("px-5 py-2.5 text-sm font-semibold rounded-xl transition-all", activeTab === tab.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800")}>{tab.label}</button>)}
    </div>
  );
}

export function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (enabled: boolean) => void; label?: string; }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button type="button" onClick={() => onChange(!enabled)} className={clsx("relative w-12 h-7 rounded-full transition-colors", enabled ? "bg-gradient-to-r from-accent-indigo to-accent-violet" : "bg-cream-200")}>
        <span className={clsx("absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform", enabled && "translate-x-5")} />
      </button>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </label>
  );
}

export function Avatar({ src, alt, size = "md", fallback }: { src?: string; alt?: string; size?: "sm" | "md" | "lg"; fallback?: string; }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };
  const [error, setError] = useState(false);
  if (src && !error) return <img src={src} alt={alt} onError={() => setError(true)} className={clsx("rounded-full object-cover bg-cream-100", sizes[size])} />;
  return <div className={clsx("rounded-full bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center", sizes[size])}><span className="font-semibold text-white">{fallback || alt?.charAt(0).toUpperCase() || "?"}</span></div>;
}

export function Divider({ label }: { label?: string; }) {
  if (label) return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
      <span className="text-xs font-semibold text-slate-400 uppercase">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
    </div>
  );
  return <div className="h-px bg-gradient-to-r from-transparent via-cream-200 to-transparent" />;
}

export function Table({ columns, data, onRowClick, emptyMessage }: { columns: { key: string; label: string; render?: (row: any) => ReactNode }[]; data: any[]; onRowClick?: (row: any) => void; emptyMessage?: string; }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gold-400/20">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-cream-50 to-rose-50 border-b border-gold-400/20">
            {columns.map((col) => <th key={col.key} className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{col.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-100">
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-5 py-16 text-center"><div className="flex flex-col items-center"><Search className="w-8 h-8 text-gold-300 mb-2" /><p className="text-slate-500">{emptyMessage || "No data found"}</p></div></td></tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} onClick={() => onRowClick?.(row)} className={clsx("hover:bg-cream-50 transition-colors", onRowClick && "cursor-pointer")}>
                {columns.map((col) => <td key={col.key} className="px-5 py-4 text-sm text-slate-700">{col.render ? col.render(row) : row[col.key]}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode; }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div><h1 className="text-3xl font-bold text-slate-800">{title}</h1>{subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}</div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, trendLabel }: { title: string; value: string | number; icon?: React.ElementType; trend?: "up" | "down"; trendLabel?: string; }) {
  return (
    <div className="bg-white rounded-2xl border border-gold-400/20 p-6 shadow-elegant hover:shadow-elegant-lg transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {trendLabel && <p className={clsx("text-xs font-semibold mt-2", trend === "up" ? "text-emerald-600" : "text-red-500")}>{trend === "up" ? "↑" : "↓"} {trendLabel}</p>}
        </div>
        {Icon && <div className="p-3.5 bg-gradient-to-br from-accent-indigo/10 to-accent-violet/10 rounded-2xl"><Icon className="w-6 h-6 text-accent-indigo" /></div>}
      </div>
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={clsx("text-xl font-bold text-slate-800 mb-4", className)}>{children}</h2>;
}

export function CommonCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("bg-white rounded-2xl border border-gold-400/20 p-6 shadow-elegant", className)}>{children}</div>;
}

export function InputField({ label, type = "text", value, onChange, placeholder, error, className }: { label?: string; type?: string; value: string; onChange: (value: string) => void; placeholder?: string; error?: string; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={clsx("w-full px-4 py-3 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all", error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-cream-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/10")} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function ButtonLoader({ className }: { className?: string }) {
  return <div className={clsx("w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin", className)} />;
}

export function InlineSpinner({ className }: { className?: string }) {
  return <div className={clsx("w-4 h-4 border-2 border-gold-200 border-t-gold-500 rounded-full animate-spin", className)} />;
}

export function SkeletonRows({ count = 5 }: { count?: number }) {
  return <div className="space-y-3">{Array.from({ length: count }).map((_, i) => <div key={i} className="h-14 bg-gradient-to-r from-cream-100 via-cream-50 to-cream-100 bg-[length:200%_100%] shimmer-gold rounded-xl" />)}</div>;
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">{message || "Loading..."}</p>
      </div>
    </div>
  );
}