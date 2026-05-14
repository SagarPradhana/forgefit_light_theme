import { motion } from "framer-motion";
import clsx from "clsx";
import { ReactNode } from "react";

interface BaseCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className, 
  hover = false, 
  onClick 
}: BaseCardProps) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-card)] transition-all duration-300",
        hover && "hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-accent)] hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface GlassCardProps extends BaseCardProps {}

export function GlassCard({ 
  children, 
  className, 
  hover = false, 
  onClick 
}: GlassCardProps) {
  return (
    <motion.div 
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : undefined}
      className={clsx(
        "rounded-2xl border border-[var(--border-subtle)] p-4 md:p-6 bg-[var(--bg-card)]/80 backdrop-blur-sm shadow-[var(--shadow-card)] transition-all duration-300",
        hover && "hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-accent)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down";
  trendLabel?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel,
  className 
}: StatCardProps) {
  return (
    <Card className={clsx("hover:shadow-[var(--shadow-hover)] hover:-translate-y-1", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {trendLabel && (
            <p className={clsx(
              "text-xs font-semibold mt-2 flex items-center gap-1",
              trend === "up" ? "text-emerald-600" : "text-red-500"
            )}>
              {trend === "up" ? "↑" : "↓"} {trendLabel}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3.5 bg-gradient-to-br from-[var(--accent-orange)]/10 to-[var(--accent-gold)]/10 rounded-2xl">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface ProfileCardProps {
  avatar?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  actions?: ReactNode;
  className?: string;
}

export function ProfileCard({
  avatar,
  name,
  role,
  email,
  phone,
  actions,
  className
}: ProfileCardProps) {
  return (
    <Card className={clsx("flex items-center gap-4", className)}>
      <div className="relative">
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border-subtle)]" 
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center text-white text-xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">{name}</h3>
        {role && <p className="text-sm text-[var(--text-muted)]">{role}</p>}
        {email && <p className="text-sm text-[var(--text-muted)] truncate">{email}</p>}
        {phone && <p className="text-sm text-[var(--text-muted)]">{phone}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </Card>
  );
}

interface PricingCardProps {
  name: string;
  price: string | number;
  period?: string;
  features: string[];
  isPopular?: boolean;
  action?: ReactNode;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period = "/month",
  features,
  isPopular = false,
  action,
  className
}: PricingCardProps) {
  return (
    <div className={clsx(
      "relative bg-[var(--bg-card)] border rounded-3xl p-8 transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2",
      isPopular 
        ? "border-[var(--accent-orange)] ring-1 ring-[var(--border-accent)] shadow-[0_0_30px_var(--glow-orange)]" 
        : "border-[var(--border-subtle)] shadow-[var(--shadow-card)]",
      className
    )}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-[0_4px_15px_var(--glow-orange)]">
            Most Popular
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-[var(--accent-orange)] text-xs font-black uppercase tracking-[0.2em] mb-2">{name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-[var(--text-primary)]">₹{price}</span>
          <span className="text-[var(--text-muted)] text-sm font-medium">{period}</span>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded-full bg-[var(--accent-orange)]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-[var(--accent-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
          </div>
        ))}
      </div>

      {action}
    </div>
  );
}

interface TestimonialCardProps {
  name: string;
  role?: string;
  avatar?: string;
  rating?: number;
  text: string;
  className?: string;
}

export function TestimonialCard({
  name,
  role,
  avatar,
  rating = 5,
  text,
  className
}: TestimonialCardProps) {
  return (
    <Card className={clsx("hover:shadow-[var(--shadow-hover)]", className)}>
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg 
            key={i} 
            className={clsx("w-5 h-5", i < rating ? "text-[var(--accent-gold)] fill-[var(--accent-gold)]" : "text-[var(--border-subtle)]")} 
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Text */}
      <p className="text-[var(--text-muted)] mb-6 italic">"{text}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--accent-gold)]" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center text-white font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-bold text-[var(--text-primary)]">{name}</p>
          {role && <p className="text-sm text-[var(--text-muted)]">{role}</p>}
        </div>
      </div>
    </Card>
  );
}

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  action,
  className
}: FeatureCardProps) {
  return (
    <Card hover className={clsx("group", className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-orange)]/10 to-[var(--accent-gold)]/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && <p className="text-[var(--text-muted)] mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </Card>
  );
}