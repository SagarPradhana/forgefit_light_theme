import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X, CheckCircle, User, Mail, Phone, Calendar, Shield, Key } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserCreationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    username?: string;
    role: string;
    email?: string;
    mobile: string;
    name: string;
    joining_date: number;
    password: string;
  } | null;
}

export const UserCreationSuccessModal = ({ 
  isOpen, 
  onClose, 
  userData 
}: UserCreationSuccessModalProps) => {
  const { t } = useTranslation();
  if (!isOpen || !userData) return null;

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "—";
    return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-hover)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">{t("userCreated")}</h2>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none">
                  {t("successfullyRegistered")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] transition-all shadow-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  <User size={12} /> {t("username")}
                </div>
                <p className="text-sm text-[var(--text-primary)] font-bold">{userData.username || "—"}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  <Shield size={12} /> {t("role")}
                </div>
                <p className="text-sm text-[var(--text-primary)] font-bold capitalize">{userData.role}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                <User size={12} /> {t("name")}
              </div>
              <p className="text-sm text-[var(--text-primary)] font-bold">{userData.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  <Mail size={12} /> {t("email")}
                </div>
                <p className="text-sm text-[var(--text-primary)] font-bold">{userData.email || "—"}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  <Phone size={12} /> {t("mobile")}
                </div>
                <p className="text-sm text-[var(--text-primary)] font-bold">{userData.mobile}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  <Calendar size={12} /> {t("joiningDate")}
                </div>
                <p className="text-sm text-[var(--text-primary)] font-bold">{formatDate(userData.joining_date)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  <Key size={12} /> {t("password")}
                </div>
                <p className="text-sm text-[var(--accent-orange)] font-bold">{userData.password}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={onClose}
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] hover:opacity-90 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};