import { motion } from "framer-motion";
import { Edit2, Calendar, ToggleRight, ToggleLeft, Trash2, FileText, Mail, Phone, Users, Loader2, ChevronLeft, ChevronRight, BadgeDollarSign, Key, Contact, Clock, MessageCircle, MoreVertical } from "lucide-react";
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
    const menuHeight = 400;

    let top = rect.bottom + 8;
    let left = rect.right - menuWidth;

    if (left < 16) left = 16;
    if (left + menuWidth > window.innerWidth - 16) left = window.innerWidth - menuWidth - 16;
    if (top + menuHeight > window.innerHeight - 16) {
      top = rect.top - menuHeight - 8;
      if (top < 16) top = 16;
    }

    setMenuPos({ top, left });
    setOpenMenuId(userId);
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;

  // ─── GRID VIEW ──────────────────────────────────────────────────────
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
                <div className="relative h-full flex flex-col rounded-[1.5rem] md:rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 md:p-6 transition-all duration-300 hover:border-[var(--accent-orange)] hover:shadow-[var(--shadow-hover)]" style={{ boxShadow: "var(--shadow-card)" }}>
                  {/* Visual Identity */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative h-14 w-14 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)] overflow-hidden flex items-center justify-center">
                      {(user.profile_image_path || user.metadata?.profile_image_path) ? (
                        <img src={user.profile_image_path || user.metadata.profile_image_path} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <span className="text-xl font-bold text-[var(--text-muted)] uppercase">{user.name?.charAt(0)}</span>
                      )}
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${user.is_active !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-xs md:text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight" title={user.name}>{user.name}</h3>
                      <p className="text-[10px] font-bold text-[var(--accent-orange)]">@{user.username || user.member_id || 'user'}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{user.role}</p>
                        {(user.purchase_id || user.metadata?.purchase_id) && (
                          <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-bold">PID: {user.purchase_id || user.metadata.purchase_id}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-[var(--text-muted)]">
                      <Mail size={12} className="shrink-0 text-[var(--accent-orange)]" />
                      <span className="text-xs truncate text-[var(--text-secondary)]">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--text-muted)]">
                      <Phone size={12} className="shrink-0 text-[var(--accent-gold)]" />
                      <span className="text-xs text-[var(--text-secondary)]">{user.mobile || user.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-auto pt-3 border-t border-[var(--border-subtle)]">
                    {portalType !== "trainer" ? (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isCurrentUser(user.id)}
                          onClick={() => onEdit(user)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${isCurrentUser(user.id)
                              ? "opacity-30 cursor-not-allowed bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                              : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--accent-orange)] hover:bg-gradient-to-r hover:from-[var(--accent-orange)] hover:to-[var(--accent-gold)] hover:text-white"}`}
                          title="Edit Profile"
                        >
                          <Edit2 size={13} />
                          <span>{t("edit")}</span>
                        </button>

                        <button
                          disabled={deletingRecord && loadingDeleteId === user.id}
                          onClick={() => onDelete(user.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border bg-red-50 border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 text-xs font-bold uppercase tracking-wider transition-all"
                          title="Delete User"
                        >
                          {deletingRecord && loadingDeleteId === user.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                          <span>{t("delete")}</span>
                        </button>

                        <div className="relative" data-menu-id={user.id}>
                          <button
                            onClick={(e) => handleMenuToggle(e, user.id)}
                            className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${openMenuId === user.id
                                ? "bg-[var(--accent-orange)] border-[var(--accent-orange)] text-white"
                                : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent-orange)]"}`}
                            title="More actions"
                          >
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenIdCard(user)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all text-xs font-bold uppercase tracking-wider"
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
              <Users size={40} className="mx-auto text-[var(--text-muted)] mb-4" />
              <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest">{t("noRecords")}</p>
            </div>
          )}
          {usersLoading && (
            <div className="col-span-full py-20 flex justify-center">
              <Loader2 className="animate-spin text-[var(--accent-orange)]" size={40} />
            </div>
          )}
        </div>

        {/* Popover menu portal */}
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
              className="w-60 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg overflow-y-auto custom-scrollbar"
            >
              <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--accent-orange)]/5 to-transparent">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-orange)]/70">{t("moreActions")}</p>
                <p className="text-[12px] font-bold text-[var(--text-primary)] truncate mt-0.5">{user.name}</p>
              </div>
              <div className="p-2 space-y-0.5">
                <button onClick={() => { onOpenIdCard(user); setOpenMenuId(null); setMenuPos(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-all group/item">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0"><Contact size={13} /></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t("idCard")}</span>
                </button>
                <button onClick={() => { onOpenSubscription(user); setOpenMenuId(null); setMenuPos(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-purple-600 transition-all group/item">
                  <div className="h-7 w-7 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0"><BadgeDollarSign size={13} /></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t("plans")}</span>
                </button>
                <button onClick={() => { onOpenAttendance(user); setOpenMenuId(null); setMenuPos(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 text-sky-600 transition-all group/item">
                  <div className="h-7 w-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0"><Calendar size={13} /></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t("attendance")}</span>
                </button>
                <button onClick={() => { onOpenDocs(user); setOpenMenuId(null); setMenuPos(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-amber-600 transition-all group/item">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0"><FileText size={13} /></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t("docs")}</span>
                </button>
                <button onClick={() => { onSendWhatsAppReminder(user); setOpenMenuId(null); setMenuPos(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 text-green-600 transition-all group/item">
                  <div className="h-7 w-7 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center shrink-0"><MessageCircle size={13} /></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t("whatsapp")}</span>
                </button>
                <button onClick={() => { onResetPassword(user); setOpenMenuId(null); setMenuPos(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-[var(--text-secondary)] transition-all group/item">
                  <div className="h-7 w-7 rounded-lg bg-gray-100 border border-[var(--border-subtle)] flex items-center justify-center shrink-0"><Key size={13} /></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t("resetPassword")}</span>
                </button>
                <div className="h-px bg-[var(--border-subtle)] my-1.5 mx-2" />
                <button
                  disabled={statusUpdating && loadingStatusId === user.id}
                  onClick={() => { onToggleStatus(user.id, user.is_active !== false); setOpenMenuId(null); setMenuPos(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group/item ${user.is_active !== false ? "hover:bg-amber-50 text-amber-600" : "hover:bg-emerald-50 text-emerald-600"}`}
                >
                  <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${user.is_active !== false ? "bg-amber-100 border-amber-200" : "bg-emerald-100 border-emerald-200"}`}>
                    {statusUpdating && loadingStatusId === user.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : user.is_active !== false ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">
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

  // ─── LIST VIEW ──────────────────────────────────────────────────────
  return (
    <div className="mb-8">
      {users.length > 0 ? (
        <div className="relative overflow-hidden rounded-xl md:rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)]" style={{ boxShadow: "var(--shadow-card)" }}>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] sticky top-0 z-10">
                  <th className="text-left py-6 px-8 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.25em] border-b border-[var(--border-subtle)]">{t("name")}</th>
                  <th className="text-left py-6 px-8 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.25em] border-b border-[var(--border-subtle)]">{t("contactMatrix")}</th>
                  <th className="text-right py-6 px-8 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.25em] border-b border-[var(--border-subtle)]">{t("operations")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-[var(--bg-secondary)] transition-all duration-300"
                  >
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-5">
                        <div className="relative h-14 w-14 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)] overflow-hidden flex items-center justify-center shrink-0 group-hover:border-[var(--accent-orange)] transition-all duration-500">
                          {(user.profile_image_path || user.metadata?.profile_image_path) ? (
                            <img src={user.profile_image_path || user.metadata.profile_image_path} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                          ) : (
                            <span className="text-lg font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors">{user.name?.charAt(0)}</span>
                          )}
                          <div className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-lg ${user.is_active !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--text-primary)] text-base uppercase tracking-tight truncate leading-tight mb-0.5 group-hover:text-[var(--accent-orange)] transition-colors" title={user.name}>{user.name}</p>
                          <p className="text-[10px] font-bold text-[var(--accent-orange)] mb-1">@{user.username || user.member_id || t("user")}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest border border-[var(--border-subtle)]">{t("role")}: {user.role}</span>
                            {(user.purchase_id || user.metadata?.purchase_id) && (
                              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-200">PID: {user.purchase_id || user.metadata.purchase_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          <div className="h-6 w-6 rounded-lg bg-[var(--accent-orange)]/10 flex items-center justify-center shrink-0">
                            <Mail size={12} className="text-[var(--accent-orange)]" />
                          </div>
                          <span className="text-xs font-medium truncate max-w-[200px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          <div className="h-6 w-6 rounded-lg bg-[var(--accent-gold)]/10 flex items-center justify-center shrink-0">
                            <Phone size={12} className="text-[var(--accent-gold)]" />
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
                              className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${isCurrentUser(user.id)
                                  ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)] cursor-not-allowed"
                                  : "bg-[var(--bg-secondary)] hover:bg-[var(--accent-orange)] text-[var(--accent-orange)] hover:text-white border-[var(--border-subtle)]"}`}
                              title={isCurrentUser(user.id) ? t("cannotEditSelf") : t("editProfile")}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => onOpenSubscription(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-purple-500 text-purple-600 hover:text-white border border-[var(--border-subtle)] transition-all"
                              title={t("membershipProtocol")}
                            >
                              <BadgeDollarSign size={16} />
                            </button>
                            <button
                              onClick={() => onOpenAttendance(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-amber-500 text-amber-600 hover:text-white border border-[var(--border-subtle)] transition-all"
                              title={t("attendanceHistory")}
                            >
                              <Clock size={16} />
                            </button>
                            <button
                              onClick={() => onOpenDocs(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-amber-500 text-amber-600 hover:text-white border border-[var(--border-subtle)] transition-all"
                              title={t("identityVault")}
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              onClick={() => onResetPassword(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-gray-500 text-[var(--text-muted)] hover:text-white border border-[var(--border-subtle)] transition-all"
                              title={t("resetSecurity")}
                            >
                              <Key size={16} />
                            </button>
                            <button
                              disabled={statusUpdating && loadingStatusId === user.id}
                              onClick={() => onToggleStatus(user.id, user.is_active !== false)}
                              className={`h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] transition-all ${user.is_active !== false
                                  ? 'text-amber-600 hover:bg-amber-500 hover:text-white'
                                  : 'text-[var(--text-muted)] hover:bg-gray-500 hover:text-white'}`}
                            >
                              {statusUpdating && loadingStatusId === user.id ? <Loader2 size={16} className="animate-spin" /> : (user.is_active !== false ? <ToggleRight size={20} /> : <ToggleLeft size={20} />)}
                            </button>
                            <button
                              onClick={() => onSendWhatsAppReminder(user)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-green-500 text-green-600 hover:text-white border border-[var(--border-subtle)] transition-all"
                              title={t("sendWhatsApp")}
                            >
                              <MessageCircle size={16} />
                            </button>
                            <button
                              disabled={deletingRecord && loadingDeleteId === user.id}
                              onClick={() => onDelete(user.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-red-500 text-red-600 hover:text-white border border-[var(--border-subtle)] transition-all"
                              title={t("terminateAccess")}
                            >
                              {deletingRecord && loadingDeleteId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onOpenIdCard(user)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-emerald-500 text-emerald-600 hover:text-white border border-[var(--border-subtle)] transition-all"
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

          {/* MOBILE LIST VIEW */}
          <div className="lg:hidden divide-y divide-[var(--border-subtle)]">
            {users.map((user, index) => (
              <div key={user.id || index} className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)] overflow-hidden flex items-center justify-center shrink-0">
                    {(user.profile_image_path || user.metadata?.profile_image_path) ? (
                      <img src={user.profile_image_path || user.metadata.profile_image_path} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <span className="text-lg font-bold text-[var(--text-muted)]">{user.name?.charAt(0)}</span>
                    )}
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${user.is_active !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-tight truncate">{user.name}</p>
                    <p className="text-[9px] text-[var(--accent-orange)] font-bold uppercase tracking-widest">#{user.member_id || user.username || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
                    <Mail size={10} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
                    <Phone size={10} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] text-[var(--text-muted)]">{user.mobile || user.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${user.is_active !== false ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {user.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                    {portalType !== "trainer" && (
                      <div className="flex gap-2">
                        <button disabled={isCurrentUser(user.id)} onClick={() => onEdit(user)} className={`h-10 w-10 flex items-center justify-center rounded-xl ${isCurrentUser(user.id) ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed" : "bg-[var(--bg-secondary)] text-[var(--accent-orange)] border border-[var(--border-subtle)]"}`}><Edit2 size={18} /></button>
                        <button onClick={() => onOpenSubscription(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200"><BadgeDollarSign size={18} /></button>
                        <button onClick={() => onOpenAttendance(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200"><Clock size={18} /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex gap-2">
                      {portalType !== "trainer" && (
                        <>
                          <button onClick={() => onOpenDocs(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200" title="Docs"><FileText size={18} /></button>
                          <button onClick={() => onResetPassword(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 text-[var(--text-muted)] border border-gray-200" title="Reset"><Key size={18} /></button>
                          <button
                            disabled={statusUpdating && loadingStatusId === user.id}
                            onClick={() => onToggleStatus(user.id, user.is_active !== false)}
                            className={`h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] ${user.is_active !== false ? 'text-amber-600' : 'text-[var(--text-muted)]'}`}
                          >
                            {statusUpdating && loadingStatusId === user.id ? <Loader2 size={18} className="animate-spin" /> : (user.is_active !== false ? <ToggleRight size={22} /> : <ToggleLeft size={22} />)}
                          </button>
                          <button
                            disabled={deletingRecord && loadingDeleteId === user.id}
                            onClick={() => onDelete(user.id)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200"
                            title="Drop"
                          >
                            {statusUpdating && loadingDeleteId === user.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                          <button
                            onClick={() => onSendWhatsAppReminder(user)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-200"
                            title="WhatsApp Reminder"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </>
                      )}
                      <button onClick={() => onOpenIdCard(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200" title="ID Card"><Contact size={18} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-8 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] gap-4">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-[var(--accent-orange)]/5 border border-[var(--border-subtle)] flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[var(--accent-orange)] animate-ping" />
                <p className="text-[10px] md:text-[11px] font-bold text-[var(--accent-orange)] uppercase tracking-[0.2em]">{t("liveRegistry")} &bull; {t("page")} {page}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={page !== 1 ? { scale: 1.05, x: -5 } : {}}
                whileTap={page !== 1 ? { scale: 0.95 } : {}}
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="flex-1 sm:flex-none group flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--accent-orange)] text-[var(--text-muted)] hover:text-white font-bold uppercase tracking-widest text-[9px] md:text-[10px] border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {t("prev")}
              </motion.button>
              <div className="hidden sm:block h-10 w-[1px] bg-[var(--border-subtle)] mx-2" />
              <motion.button
                whileHover={hasMore ? { scale: 1.05, x: 5 } : {}}
                whileTap={hasMore ? { scale: 0.95 } : {}}
                disabled={!hasMore}
                onClick={() => onPageChange(page + 1)}
                className="flex-1 sm:flex-none group flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] hover:from-[var(--accent-gold)] hover:to-[var(--accent-orange)] text-white font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {t("next")}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : usersLoading ? (
        <div className="p-8 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] overflow-hidden relative" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-orange)] to-transparent" />
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-[var(--accent-orange)]/10 animate-pulse" />
            <div>
              <div className="h-4 w-32 bg-[var(--bg-secondary)] rounded-md mb-2 animate-pulse" />
              <div className="h-3 w-48 bg-[var(--bg-secondary)] rounded-md animate-pulse" />
            </div>
          </div>
          <SkeletonRows count={8} />
        </div>
      ) : (
        <div className="text-center py-32 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-subtle)]" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="h-24 w-24 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-8">
            <Users size={48} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] uppercase italic tracking-tighter mb-3">{t("voidDetected")}</h3>
          <p className="text-sm text-[var(--text-muted)] font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">{t("noRegistryEntries")}</p>
        </div>
      )}
    </div>
  );
};