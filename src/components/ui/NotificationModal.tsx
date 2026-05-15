import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, CheckCircle, Bell, Info, AlertTriangle, AlertCircle, Clock, CheckSquare } from "lucide-react";
import { useNotificationStore, type Notification } from "../../store/notificationStore";
import { createPortal } from "react-dom";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId?: string | null;
}

export const NotificationModal = ({ isOpen, onClose, selectedId }: NotificationModalProps) => {
  const { notifications, markAsRead, removeNotification, clearAll } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<"All" | "Unread" | "Archive">("All");

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Archive") return n.read;
    return true;
  });

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return (
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]">
          <CheckCircle size={20} className="text-emerald-600" />
        </div>
      );
      case "warning": return (
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
      );
      case "error": return (
        <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]">
          <AlertCircle size={20} className="text-red-600" />
        </div>
      );
      default: return (
        <div className="h-10 w-10 rounded-xl bg-[var(--accent-orange)]/10 flex items-center justify-center border border-[var(--accent-orange)]/20 shadow-[0_0_15px_-5px_rgba(232,82,26,0.3)]">
          <Info size={20} className="text-[var(--accent-orange)]" />
        </div>
      );
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[32px] overflow-hidden shadow-[var(--shadow-hover)]"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-orange)]/50 to-transparent" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--accent-orange)]/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[var(--accent-gold)]/10 rounded-full blur-[80px]" />

        {/* Header */}
        <div className="px-8 py-7 flex items-center justify-between border-b border-[var(--border-subtle)] relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-[var(--accent-orange)]/20 to-[var(--accent-gold)]/20 rounded-2xl text-[var(--accent-orange)] border border-[var(--border-subtle)] shadow-lg">
                <Bell size={24} />
              </div>
              {notifications.some(n => !n.read) && (
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-wider mb-0.5">Alert Center</h2>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.1em]">Updates & System Logs</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="group flex items-center gap-2 px-3 py-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                title="Clear All"
              >
                <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters/Tabs */}
        <div className="px-8 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex gap-4 overflow-x-auto no-scrollbar">
          {(["All", "Unread", "Archive"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition ${activeTab === tab ? 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="max-h-[55vh] overflow-y-auto px-6 py-4 custom-scrollbar relative z-10">
          <AnimatePresence initial={false} mode="wait">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 flex flex-col items-center justify-center text-center px-10"
              >
                <div className="h-20 w-20 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center mb-6 border border-[var(--border-subtle)] rotate-12">
                  <Bell size={40} className="text-[var(--text-muted)] -rotate-12" />
                </div>
                <h3 className="text-[var(--text-primary)] font-black uppercase tracking-wider mb-2">Universe is Quiet</h3>
                <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed">
                  You're all caught up! No new notifications at the moment. Check back later for gym updates.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative p-5 rounded-[24px] border transition-all duration-500 ${notif.read
                        ? "bg-[var(--bg-secondary)] border-[var(--border-subtle)] opacity-70 hover:opacity-100"
                        : "bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-card)] border-[var(--border-subtle)] shadow-[var(--shadow-card)] hover:from-[var(--bg-card-hover)]"
                      } ${selectedId === notif.id ? "ring-2 ring-[var(--accent-orange)]/50 ring-offset-[4px] ring-offset-white" : ""}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex gap-5">
                      <div className="shrink-0 transition-transform group-hover:scale-110 duration-500">
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-[14px] font-black tracking-tight transition-colors ${notif.read ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
                              {notif.title}
                            </h3>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-orange)]" />
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-bold whitespace-nowrap">{formatTimestamp(notif.timestamp)}</span>
                        </div>
                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
