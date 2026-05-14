import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { ButtonLoader, CommonButton } from "../ui/primitives";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isProcessing?: boolean;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to permanently remove this record? This action cannot be undone.",
  confirmLabel = "Delete Now",
  isProcessing = false,
}: DeleteConfirmationModalProps) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-[var(--shadow-hover)]"
          >
            <button
              onClick={isProcessing ? undefined : onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] transition-all z-20"
              disabled={isProcessing}
            >
              <X size={18} />
            </button>

            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="p-8 relative z-10">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                  <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-red-500/40">
                    <Trash2 size={36} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[var(--bg-card)] border-4 border-[var(--bg-card)] flex items-center justify-center">
                    <AlertTriangle size={14} className="text-red-500" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-2">
                  {title}
                </h3>
                <div className="h-1 w-12 bg-red-500 rounded-full mb-4" />
                <p className="text-[var(--text-muted)] font-medium leading-relaxed max-w-[280px]">
                  {description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <CommonButton
                  variant="ghost"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="py-4 rounded-xl border-[var(--border-subtle)] hover:border-[var(--accent-orange)] text-[var(--text-secondary)] font-bold"
                >
                  Cancel
                </CommonButton>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all border border-red-400/20 disabled:opacity-50"
                >
                  <ButtonLoader
                    label={confirmLabel}
                    loadingLabel="Deleting"
                    loading={isProcessing}
                    spinnerClassName="text-white"
                  />
                </motion.button>
              </div>
            </div>

            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-30" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};