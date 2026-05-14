import clsx from "clsx";
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

// ==================== Input ====================
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full px-4 py-3 bg-[var(--bg-card)] border rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all",
              icon ? "pl-11" : "",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-[var(--border-subtle)] focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)]"
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {helper && !error && <p className="text-xs text-[var(--text-muted)] mt-1">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

// ==================== Textarea ====================
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 bg-[var(--bg-card)] border rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all resize-none",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-[var(--border-subtle)] focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)]"
          )}
          rows={4}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {helper && !error && <p className="text-xs text-[var(--text-muted)] mt-1">{helper}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// ==================== Select ====================
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 bg-[var(--bg-card)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none transition-all appearance-none cursor-pointer",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-[var(--border-subtle)] focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)]"
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

// ==================== Checkbox ====================
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            "w-5 h-5 rounded border-[var(--border-subtle)] text-[var(--accent-orange)] focus:ring-[var(--accent-orange)] focus:ring-offset-0 cursor-pointer",
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-[var(--text-secondary)]">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

// ==================== Radio ====================
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  options: { value: string; label: string }[];
  name: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, options, name, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-3">
            {label}
          </label>
        )}
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
              <input
                ref={ref}
                type="radio"
                name={name}
                value={opt.value}
                className={clsx(
                  "w-5 h-5 border-[var(--border-subtle)] text-[var(--accent-orange)] focus:ring-[var(--accent-orange)] cursor-pointer",
                  className
                )}
                {...props}
              />
              <span className="text-sm text-[var(--text-secondary)]">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
);

Radio.displayName = "Radio";

// ==================== Toggle ====================
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ enabled, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        className={clsx(
          "relative w-12 h-7 rounded-full transition-all",
          enabled 
            ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] shadow-[0_4px_15px_var(--glow-orange)]" 
            : "bg-[var(--bg-secondary)] border border-[var(--border-subtle)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
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

// ==================== Form Group ====================
interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={clsx("space-y-4", className)}>{children}</div>;
}

// ==================== Form Row ====================
interface FormRowProps {
  children: ReactNode;
  columns?: number;
  className?: string;
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={clsx("grid gap-4", gridClass[columns as keyof typeof gridClass], className)}>
      {children}
    </div>
  );
}

// ==================== Form Actions ====================
interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={clsx("flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]", className)}>
      {children}
    </div>
  );
}