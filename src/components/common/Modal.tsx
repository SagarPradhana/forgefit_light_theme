import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };

  if (!isOpen && !isClosing) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-lg"
          onClick={closeOnOverlay ? handleClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            "relative z-10 w-full bg-white rounded-3xl border border-gray-200 overflow-hidden",
            sizes[size],
            className
          )}
          style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              {title && (
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              {footer}
            </div>
          )}

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 opacity-50" />
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

// ==================== Confirm Modal ====================
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const variants = {
    danger: "from-red-500 to-red-600",
    warning: "from-amber-500 to-orange-500",
    info: "from-blue-500 to-indigo-500",
  };

  const iconColors = {
    danger: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={clsx(
          "w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center",
          `bg-gradient-to-br ${variants[variant]}/10`
        )}>
          <svg 
            className={clsx("w-8 h-8", iconColors[variant])} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-[var(--text-muted)] mb-6">{message}</p>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button 
            variant={variant === "danger" ? "danger" : "primary"} 
            onClick={onConfirm} 
            loading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ==================== Drawer Modal ====================
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: "left" | "right";
  size?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  size = "400px",
}: DrawerProps) {
  const positions = {
    left: { 
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" }
    },
    right: { 
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" }
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-lg"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={positions[position].initial}
            animate={positions[position].animate}
            exit={positions[position].exit}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={clsx(
              "absolute top-0 bottom-0 bg-white border-gray-200",
              position === "right" ? "right-0 border-l" : "left-0 border-r"
            )}
            style={{ width: size, maxWidth: "90vw", boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}
          >
            {/* Header */}
            {(title) && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}