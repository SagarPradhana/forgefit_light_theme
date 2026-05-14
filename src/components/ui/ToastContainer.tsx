import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "../../store/toastStore";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 min-w-[340px] max-w-md p-4 rounded-2xl border shadow-elegant bg-white ${
              toast.type === "success"
                ? "border-emerald-200"
                : toast.type === "info"
                ? "border-accent-indigo/20"
                : "border-red-200"
            }`}
            onClick={() => removeToast(toast.id)}
          >
            <div className={`p-2.5 rounded-xl ${
              toast.type === "success" 
                ? "bg-emerald-50" 
                : toast.type === "info"
                ? "bg-gradient-to-br from-accent-indigo/10 to-accent-violet/10"
                : "bg-red-50"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle size={20} className="text-emerald-500" />
              ) : toast.type === "info" ? (
                <Info size={20} className="text-accent-indigo" />
              ) : (
                <AlertCircle size={20} className="text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{toast.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-1.5 hover:bg-cream-50 rounded-lg transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}