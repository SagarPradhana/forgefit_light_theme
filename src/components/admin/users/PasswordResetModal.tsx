import { useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Lock, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../utils/url";
import { toast } from "../../../store/toastStore";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName?: string;
}

export const PasswordResetModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName
}: PasswordResetModalProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: resetPassword, loading } = useMutation("put", {
    onSuccess: () => {
      toast.success("Password reset successfully");
      handleClose();
    },
    onError: () => {
      toast.error("Failed to reset password");
    }
  });

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const payload = {
      new_password: newPassword
    };

    resetPassword(API_ENDPOINTS.ADMIN.USER_RESET_PASSWORD(userId), payload);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-hover)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-orange-500/5 pointer-events-none" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-subtle)]">
                <Lock className="text-[var(--accent-orange)]" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Reset Password</h2>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none">
                  {userName ? `for ${userName}` : "Update credentials"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] transition-all shadow-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-orange)] transition-colors">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl pl-10 pr-12 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] transition-all placeholder-[var(--text-muted)] shadow-inner"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-orange)] transition-colors">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl pl-10 pr-12 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)] transition-all placeholder-[var(--text-muted)] shadow-inner"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)] transition-all shadow-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] hover:opacity-90 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};