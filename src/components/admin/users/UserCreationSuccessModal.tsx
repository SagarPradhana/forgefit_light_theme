import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X, CheckCircle, User, Mail, Phone, Calendar, Shield, Key } from "lucide-react";

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="text-emerald-500" size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">User Created</h2>
              <p className="text-xs text-gray-500">Successfully registered</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-0.5">
                <User size={12} /> Username
              </div>
              <p className="text-sm font-semibold text-gray-900">{userData.username || "—"}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-0.5">
                <Shield size={12} /> Role
              </div>
              <p className="text-sm font-semibold text-gray-900 capitalize">{userData.role}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-0.5">
              <User size={12} /> Name
            </div>
            <p className="text-sm font-semibold text-gray-900">{userData.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-0.5">
                <Mail size={12} /> Email
              </div>
              <p className="text-sm font-semibold text-gray-900">{userData.email || "—"}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-0.5">
                <Phone size={12} /> Mobile
              </div>
              <p className="text-sm font-semibold text-gray-900">{userData.mobile}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-0.5">
                <Calendar size={12} /> Joining Date
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatDate(userData.joining_date)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-0.5">
                <Key size={12} /> Password
              </div>
              <p className="text-sm font-semibold text-orange-500">{userData.password}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all">
            Close
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};