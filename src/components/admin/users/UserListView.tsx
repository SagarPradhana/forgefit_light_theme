import { motion } from "framer-motion";
import { Edit2, Calendar, ToggleRight, ToggleLeft, Trash2, FileText, Mail, Phone, Users, Loader2, ChevronLeft, ChevronRight, CreditCard, Key, Contact, Clock, MessageCircle, MoreVertical } from "lucide-react";
import { SkeletonRows } from "../../ui/primitives";
import type { ViewType } from "./types";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";

interface UserListViewProps {
  viewType: ViewType;
  users: any[];
  usersLoading: boolean;
  statusUpdating: boolean;
  deletingRecord: boolean;
  loadingStatusId: string | null;
  loadingDeleteId: string | null;
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onEdit: (user: any) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onOpenDocs: (user: any) => void;
  onOpenAttendance: (user: any) => void;
  onOpenSubscription: (user: any) => void;
  onResetPassword: (user: any) => void;
  onOpenIdCard: (user: any) => void;
  onSendWhatsAppReminder: (user: any) => void;
  lastUserElementRef: (node: HTMLDivElement) => void;
  portalType?: "admin" | "trainer";
}

export const UserListView = ({
  viewType,
  users,
  usersLoading,
  statusUpdating,
  deletingRecord,
  loadingStatusId,
  loadingDeleteId,
  page,
  hasMore,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenDocs,
  onOpenAttendance,
  onOpenSubscription,
  onResetPassword,
  onOpenIdCard,
  onSendWhatsAppReminder,
  lastUserElementRef,
  portalType = "admin",
}: UserListViewProps) => {
  const { t } = useTranslation();
  const { id: currentUserId } = useAuthStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close popover on outside click or scroll
  useEffect(() => {
    if (!openMenuId) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`[data-menu-id="${openMenuId}"]`) && !target.closest('[data-popover="user-menu"]')) {
        setOpenMenuId(null);
        setMenuPos(null);
      }
    };
    const closeOnScroll = () => { setOpenMenuId(null); setMenuPos(null); };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [openMenuId]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    if (openMenuId === userId) {
      setOpenMenuId(null);
      setMenuPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 240;
    const menuHeight = 400; // Estimated max height
    
    let top = rect.bottom + 8;
    let left = rect.right - menuWidth;

    // Viewport overflow checks
    if (left < 16) left = 16;
    if (left + menuWidth > window.innerWidth - 16) left = window.innerWidth - menuWidth - 16;
    if (top + menuHeight > window.innerHeight - 16) {
      top = rect.top - menuHeight - 8;
      if (top < 16) top = 16; // Fallback to top if no space either way
    }

    setMenuPos({ top, left });
    setOpenMenuId(userId);
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;
  if (viewType === "grid") {
    return (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8 overflow-visible">
        {users.length > 0 ? (
          users.map((user: any, index) => (
            <motion.div
              key={user.id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-visible"
              ref={index === users.length - 1 ? lastUserElementRef : null}
            >
              <div className="relative h-full flex flex-col rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-3xl p-4 md:p-6 transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/80">
                {/* Visual Identity */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative h-14 w-14 rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                    {(user.profile_image_path || user.metadata?.profile_image_path) ? (
                      <img src={user.profile_image_path || user.metadata.profile_image_path} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <span className="text-xl font-black text-slate-500 uppercase">{user.name?.charAt(0)}</span>
                    )}
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${user.is_active !== false ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xs md:text-sm font-black text-white uppercase tracking-tight" title={user.name}>{user.name}</h3>
                    <p className="text-[10px] font-bold text-indigo-400">@{user.username || user.member_id || 'user'}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
                      {(user.purchase_id || user.metadata?.purchase_id) && (
                        <span className="text-[8px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 font-black">PID: {user.purchase_id || user.metadata.purchase_id}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail size={12} className="shrink-0" />
                    <span className="text-xs truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone size={12} className="shrink-0" />
                    <span className="text-xs">{user.mobile || user.phone || 'N/A'}</span>
                  </div>
                </div>

                {/* ── Action Bar: Edit · Delete · ⋯ ── */}
                <div className="mt-auto pt-3 border-t border-white/5">
                  {portalType !== "trainer" ? (
                    <div className="flex items-center gap-2">

                      {/* Edit */}
                      <button
                        disabled={isCurrentUser(user.id)}
                        onClick={() => onEdit(user)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                          isCurrentUser(user.id)
                            ? "opacity-30 cursor-not-allowed bg-white/3 border-white/5 text-slate-500"
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"}`}
                        title="Edit Profile"
                      >
                        <Edit2 size={13} />
                        <span>{t("edit")}</span>
                      </button>

                      {/* Delete */}
                      <button
                        disabled={deletingRecord && loadingDeleteId === user.id}
                        onClick={() => onDelete(user.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 text-xs font-black uppercase tracking-wider transition-all"
                        title="Delete User"
                      >
                        {deletingRecord && loadingDeleteId === user.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />}
                        <span>{t("delete")}</span>
                      </button>

                      {/* ⋯ More actions */}
                      <div className="relative" data-menu-id={user.id}>
                        <button
                          onClick={(e) => handleMenuToggle(e, user.id)}
                          className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${
                            openMenuId === user.id
                              ? "bg-white/15 border-white/20 text-white"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"}`}
                          title="More actions"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>

                    </div>
                  ) : (
                    /* Trainer view — just ID Card */
                    <button
                      onClick={() => onOpenIdCard(user)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all text-xs font-black uppercase tracking-wider"
                    >
                      <Contact size={14} /><span>{t("viewIdCard")}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : !usersLoading && (
          <div className="col-span-full py-20 text-center">
            <Users size={40} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">{t("noRecords")}</p>
          </div>
        )}
        {usersLoading && (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        )}
      </div>

      {/* ── Fixed-position popover rendered at body level via portal ── */}
      {openMenuId && menuPos && (() => {
        const user = users.find(u => u.id === openMenuId);
        if (!user) return null;
        return createPortal(
          <motion.div
            data-popover="user-menu"
            initial={{ opacity: 0, scale: 0.93, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ 
              position: "fixed", 
              top: menuPos.top, 
              left: menuPos.left, 
              zIndex: 9999,
              maxHeight: "calc(100vh - 40px)"
            }}
            className="w-60 rounded-2xl border border-white/15 bg-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/10 to-transparent">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/80">{t("moreActions")}</p>
              <p className="text-[12px] font-black text-white truncate mt-0.5">{user.name}</p>
            </div>
            {/* Actions */}
            <div className="p-2 space-y-0.5">
              <button onClick={() => { onOpenIdCard(user); setOpenMenuId(null); setMenuPos(null); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-400 transition-all group/item">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0"><Contact size={13} /></div>
                <span className="text-[11px] font-black uppercase tracking-wider">{t("idCard")}</span>
              </button>
              <button onClick={() => { onOpenSubscription(user); setOpenMenuId(null); setMenuPos(null); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/20 text-purple-400 transition-all group/item">
                <div className="h-7 w-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0"><CreditCard size={13} /></div>
                <span className="text-[11px] font-black uppercase tracking-wider">{t("plans")}</span>
              </button>
              <button onClick={() => { onOpenAttendance(user); setOpenMenuId(null); setMenuPos(null); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-500/20 text-sky-400 transition-all group/item">
                <div className="h-7 w-7 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0"><Calendar size={13} /></div>
                <span className="text-[11px] font-black uppercase tracking-wider">{t("attendance")}</span>
              </button>
              <button onClick={() => { onOpenDocs(user); setOpenMenuId(null); setMenuPos(null); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/20 text-amber-400 transition-all group/item">
                <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0"><FileText size={13} /></div>
                <span className="text-[11px] font-black uppercase tracking-wider">{t("docs")}</span>
              </button>
              <button onClick={() => { onSendWhatsAppReminder(user); setOpenMenuId(null); setMenuPos(null); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-500/20 text-green-400 transition-all group/item">
                <div className="h-7 w-7 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0"><MessageCircle size={13} /></div>
                <span className="text-[11px] font-black uppercase tracking-wider">{t("whatsapp")}</span>
              </button>
              <button onClick={() => { onResetPassword(user); setOpenMenuId(null); setMenuPos(null); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-700/50 text-slate-300 transition-all group/item">
                <div className="h-7 w-7 rounded-lg bg-slate-700/50 border border-white/10 flex items-center justify-center shrink-0"><Key size={13} /></div>
                <span className="text-[11px] font-black uppercase tracking-wider">{t("resetPassword")}</span>
              </button>
              <div className="h-px bg-white/10 my-1.5 mx-2" />
              <button
                disabled={statusUpdating && loadingStatusId === user.id}
                onClick={() => { onToggleStatus(user.id, user.is_active !== false); setOpenMenuId(null); setMenuPos(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group/item ${
                  user.is_active !== false ? "hover:bg-amber-500/20 text-amber-400" : "hover:bg-emerald-500/20 text-emerald-400"}`}
              >
                <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${
                  user.is_active !== false ? "bg-amber-500/15 border-amber-500/20" : "bg-emerald-500/15 border-emerald-500/20"}`}>
                  {statusUpdating && loadingStatusId === user.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : user.is_active !== false ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {user.is_active !== false ? t("suspendUser") : t("activateUser")}
                </span>
              </button>
            </div>
          </motion.div>,
          document.body
        );
      })()}
      </>
    );
  }

  return (
    <div className="mb-8">
      {users.length > 0 ? (
        <div className="relative overflow-hidden rounded-xl md:rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-3xl shadow-2xl">
          <div className="hidden lg:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-white/10 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-white/10">{t("name")}</th>
                  <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-white/10">{t("contactMatrix")}</th>
                  <th className="text-right py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-white/10">{t("operations")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-gradient-to-b from-transparent to-white/[0.02]">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-5">
                        <div className="relative h-14 w-14 rounded-2xl bg-slate-800 border-2 border-white/15 overflow-hidden flex items-center justify-center shrink-0 shadow-2xl group-hover:border-indigo-500/50 transition-all duration-500">
                          {(user.profile_image_path || user.metadata?.profile_image_path) ? (
                            <img src={user.profile_image_path || user.metadata.profile_image_path} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                          ) : (
                            <span className="text-lg font-black text-slate-500 group-hover:text-indigo-400 transition-colors">{user.name?.charAt(0)}</span>
                          )}
                          <div className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900 shadow-lg ${user.is_active !== false ? 'bg-emerald-500' : 'bg-slate-500'} animate-pulse`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white text-base uppercase tracking-tight truncate leading-tight mb-0.5 group-hover:text-indigo-200 transition-colors" title={user.name}>{user.name}</p>
                          <p className="text-[10px] font-black text-indigo-400 mb-1">@{user.username || user.member_id || t("user")}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-slate-500 font-bold uppercase tracking-widest border border-white/5 group-hover:text-slate-300 transition-colors">{t("role")}: {user.role}</span>
                            {(user.purchase_id || user.metadata?.purchase_id) && (
                              <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">PID: {user.purchase_id || user.metadata.purchase_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                          <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Mail size={12} className="text-indigo-400" />
                          </div>
                          <span className="text-xs font-medium truncate max-w-[200px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                          <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                            <Phone size={12} className="text-orange-400" />
                          </div>
                          <span className="text-xs font-bold tracking-tight">{user.mobile || user.phone || t("noData")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2 group-hover:scale-105 transition-transform origin-right">
                        {portalType !== "trainer" && (
                          <>
                            <button
                              disabled={isCurrentUser(user.id)}
                              onClick={() => onEdit(user)}
                              className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all shadow-xl group/btn ${isCurrentUser(user.id) ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed" : "bg-white/[0.07] hover:bg-indigo-500 text-indigo-400 hover:text-white border-white/5 hover:shadow-indigo-500/40"}`}
                              title={isCurrentUser(user.id) ? t("cannotEditSelf") : t("editProfile")}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => onOpenSubscription(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-purple-500 text-purple-400 hover:text-white border border-white/5 transition-all shadow-xl hover:shadow-purple-500/40"
                              title={t("membershipProtocol")}
                            >
                              <CreditCard size={16} />
                            </button>
                            <button
                              onClick={() => onOpenAttendance(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-amber-500 text-amber-400 hover:text-white border border-white/5 transition-all shadow-xl hover:shadow-amber-500/40"
                              title={t("attendanceHistory")}
                            >
                              <Clock size={16} />
                            </button>
                            <button
                              onClick={() => onOpenDocs(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-amber-500 text-amber-400 hover:text-white border border-white/5 transition-all shadow-xl hover:shadow-amber-500/40"
                              title={t("identityVault")}
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              onClick={() => onResetPassword(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-slate-600 text-slate-400 hover:text-white border border-white/5 transition-all shadow-xl hover:shadow-slate-500/40"
                              title={t("resetSecurity")}
                            >
                              <Key size={16} />
                            </button>
                            <button
                              disabled={statusUpdating && loadingStatusId === user.id}
                              onClick={() => onToggleStatus(user.id, user.is_active !== false)}
                              className={`h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] border border-white/5 transition-all shadow-xl ${user.is_active !== false ? 'text-amber-500 hover:bg-amber-500 hover:text-white shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-500 hover:text-white'}`}
                            >
                              {statusUpdating && loadingStatusId === user.id ? <Loader2 size={16} className="animate-spin" /> : (user.is_active !== false ? <ToggleRight size={20} /> : <ToggleLeft size={20} />)}
                            </button>
                            <button
                              onClick={() => onSendWhatsAppReminder(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-green-500 text-green-400 hover:text-white border border-white/5 transition-all shadow-xl hover:shadow-green-500/40"
                              title={t("sendWhatsApp")}
                            >
                              <MessageCircle size={16} />
                            </button>
                            <button
                              disabled={deletingRecord && loadingDeleteId === user.id}
                              onClick={() => onDelete(user.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-red-500 text-red-500 hover:text-white border border-white/5 transition-all shadow-xl hover:shadow-red-500/40"
                              title={t("terminateAccess")}
                            >
                              {deletingRecord && loadingDeleteId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onOpenIdCard(user)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-emerald-500 text-emerald-400 hover:text-white border border-white/5 transition-all shadow-xl hover:shadow-emerald-500/40"
                          title={t("viewIdCard")}
                        >
                          <Contact size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST VIEW (Responsive Cards) */}
          <div className="lg:hidden divide-y divide-white/5">
            {users.map((user, index) => (
              <div key={user.id || index} className="p-4 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-xl bg-slate-800 border-2 border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {(user.profile_image_path || user.metadata?.profile_image_path) ? (
                      <img src={user.profile_image_path || user.metadata.profile_image_path} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <span className="text-lg font-black text-slate-500">{user.name?.charAt(0)}</span>
                    )}
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${user.is_active !== false ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-sm uppercase tracking-tight truncate">{user.name}</p>
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">#{user.member_id || user.username || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <Mail size={10} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <Phone size={10} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400">{user.mobile || user.phone || 'N/A'}</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <span className="text-[10px] text-indigo-400 font-black">#{user.member_id || user.username || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${user.is_active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/20 text-slate-500'}`}>
                      {user.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                    {portalType !== "trainer" && (
                      <div className="flex gap-2">
                        <button disabled={isCurrentUser(user.id)} onClick={() => onEdit(user)} className={`h-10 w-10 flex items-center justify-center rounded-xl shadow-lg ${isCurrentUser(user.id) ? "bg-slate-500/10 text-slate-600 border border-slate-500/20 cursor-not-allowed" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}><Edit2 size={18} /></button>
                        <button onClick={() => onOpenSubscription(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg"><CreditCard size={18} /></button>
                        <button onClick={() => onOpenAttendance(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg"><Clock size={18} /></button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <div className="flex gap-2">
                      {portalType !== "trainer" && (
                        <>
                          <button onClick={() => onOpenDocs(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg" title="Docs"><FileText size={18} /></button>
                          <button onClick={() => onResetPassword(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-lg" title="Reset"><Key size={18} /></button>
                          <button
                            disabled={statusUpdating && loadingStatusId === user.id}
                            onClick={() => onToggleStatus(user.id, user.is_active !== false)}
                            className={`h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 shadow-lg ${user.is_active !== false ? 'text-amber-500' : 'text-slate-500'}`}
                          >
                            {statusUpdating && loadingStatusId === user.id ? <Loader2 size={18} className="animate-spin" /> : (user.is_active !== false ? <ToggleRight size={22} /> : <ToggleLeft size={22} />)}
                          </button>
                          <button
                            disabled={deletingRecord && loadingDeleteId === user.id}
                            onClick={() => onDelete(user.id)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg"
                            title="Drop"
                          >
                            {statusUpdating && loadingDeleteId === user.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                          <button
                            onClick={() => onSendWhatsAppReminder(user)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 shadow-lg"
                            title="WhatsApp Reminder"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </>
                      )}
                      <button onClick={() => onOpenIdCard(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg" title="ID Card"><Contact size={18} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ULTRA VISIBLE PAGINATION HUB */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-8 bg-black/40 border-t border-white/10 backdrop-blur-2xl gap-4">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <p className="text-[10px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">{t("liveRegistry")} • {t("page")} {page}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={page !== 1 ? { scale: 1.05, x: -5 } : {}}
                whileTap={page !== 1 ? { scale: 0.95 } : {}}
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="flex-1 sm:flex-none group flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-white/10 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] border border-white/10 hover:border-indigo-400 transition-all shadow-2xl disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {t("prev")}
              </motion.button>

              <div className="hidden sm:block h-10 w-[1px] bg-white/10 mx-2" />

              <motion.button
                whileHover={hasMore ? { scale: 1.05, x: 5 } : {}}
                whileTap={hasMore ? { scale: 0.95 } : {}}
                disabled={!hasMore}
                onClick={() => onPageChange(page + 1)}
                className="flex-1 sm:flex-none group flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] border border-indigo-400 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {t("next")}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : usersLoading ? (
        <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer" />
           <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 animate-pulse" />
              <div>
                <div className="h-4 w-32 bg-white/10 rounded-md mb-2 animate-pulse" />
                <div className="h-3 w-48 bg-white/5 rounded-md animate-pulse" />
              </div>
           </div>
           <SkeletonRows count={8} />
        </div>
      ) : (
        <div className="text-center py-32 bg-slate-900/60 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="h-24 w-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Users size={48} className="text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-3">{t("voidDetected")}</h3>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">{t("noRegistryEntries")}</p>
        </div>
      )}
    </div>
  );
};
