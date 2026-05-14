import { motion } from "framer-motion";
import clsx from "clsx";

// ==================== Skeleton Components ====================

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = "rectangular", 
  width, 
  height 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--bg-secondary)] bg-[length:200%_100%]";
  
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  );
}

// Text skeleton with optional label
export function SkeletonText({ 
  lines = 1, 
  className,
  spacing = "mb-2"
}: { 
  lines?: number; 
  className?: string;
  spacing?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={clsx(spacing, i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
          height={i === lines - 1 && lines > 1 ? 16 : 20} 
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

// Card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx("bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6", className)}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size={56} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={20} className="mb-2" />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-[var(--border-subtle)]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton variant="text" height={16} />
        </td>
      ))}
    </tr>
  );
}

// Table skeleton
export function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number; 
  columns?: number;
  className?: string;
}) {
  return (
    <div className={clsx("overflow-x-auto rounded-2xl border border-[var(--border-subtle)]", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-4 text-left">
                <Skeleton variant="text" width={80} height={14} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Form skeleton
export function SkeletonForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton variant="text" width={100} height={14} className="mb-2" />
          <Skeleton height={48} />
        </div>
      ))}
    </div>
  );
}

// ==================== Full Screen Loader ====================

interface FullScreenLoaderProps {
  message?: string;
  overlay?: boolean;
}

export function FullScreenLoader({ 
  message = "Loading...", 
  overlay = true 
}: FullScreenLoaderProps) {
  return (
    <div className={clsx(
      "fixed inset-0 z-[9999] flex items-center justify-center",
      overlay ? "bg-[var(--bg-primary)]/80 backdrop-blur-sm" : "bg-transparent"
    )}>
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border-subtle)]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[var(--accent-orange)] border-r-transparent animate-spin" />
        </div>
        <p className="text-[var(--text-secondary)] font-medium">{message}</p>
      </div>
    </div>
  );
}

// Inline spinner
export function LoaderSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div 
      className={clsx("animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent-orange)]", className)}
      style={{ width: size, height: size }}
    />
  );
}

// Button with loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({ 
  loading, 
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <button 
      className={clsx(
        "relative inline-flex items-center justify-center gap-2",
        loading && "cursor-not-allowed opacity-70",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderSpinner size={16} />}
      {children}
    </button>
  );
}

// ==================== Data Fetch States ====================

interface LoadingStateProps {
  type?: "skeleton" | "spinner" | "fullscreen";
  message?: string;
  className?: string;
}

export function LoadingState({ 
  type = "skeleton", 
  message = "Loading...",
  className 
}: LoadingStateProps) {
  if (type === "fullscreen") {
    return <FullScreenLoader message={message} />;
  }
  
  if (type === "spinner") {
    return (
      <div className={clsx("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <LoaderSpinner size={40} className="mx-auto mb-3" />
          <p className="text-[var(--text-muted)]">{message}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={clsx("py-8", className)}>
      <SkeletonCard />
      <SkeletonCard className="mt-4" />
      <SkeletonCard className="mt-4" />
    </div>
  );
}

// Error state
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = "Something went wrong", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-[var(--text-secondary)] font-medium mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-[var(--accent-orange)] text-white rounded-lg font-medium hover:opacity-90 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Empty state
interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  title = "No data found", 
  description = "There are no records to display at this time.",
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-muted)] text-center max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}