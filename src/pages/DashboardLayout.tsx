import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect } from "react";
import {
  Box,
  ChevronLeft,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Palette,
  Settings,
  TrendingUp,
  User,
  Users,
  Menu,
  X,
  ClipboardList,
  Calendar,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";

import { useGymStore } from "../store/gymStore";
import { api } from "../utils/httputils";
import { API_ENDPOINTS } from "../utils/url";

const themes = [
  { id: 'elegant', name: 'Elegant Pearl', primary: 'from-indigo-500 to-violet-500', secondary: 'from-rose-400 to-pink-500', accent: '#d4a853' },
  { id: 'rose', name: 'Rose Gold', primary: 'from-rose-400 to-pink-500', secondary: 'from-amber-400 to-orange-400', accent: '#e8c4b8' },
  { id: 'sage', name: 'Sage Luxury', primary: 'from-emerald-400 to-teal-500', secondary: 'from-amber-400 to-yellow-500', accent: '#10b981' },
  { id: 'violet', name: 'Violet Royale', primary: 'from-violet-500 to-purple-600', secondary: 'from-pink-400 to-rose-500', accent: '#8b5cf6' },
  { id: 'gold', name: 'Golden Luxe', primary: 'from-amber-400 to-yellow-500', secondary: 'from-orange-400 to-amber-400', accent: '#f59e0b' },
];

export function Sidebar({
  currentTheme,
  isMobile,
  onClose,
}: {
  currentTheme: typeof themes[0];
  isMobile: boolean;
  onClose?: () => void;
}) {
  const { role, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const links = role === "admin" ? [
    { name: "dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { name: "users", icon: Users, label: t("users") },
    { name: "attendance", icon: Calendar, label: t("attendance") },
    { name: "subscriptions", icon: CreditCard, label: t("subscription") },
    { name: "payments", icon: CreditCard, label: t("payments") },
    { name: "products", icon: Box, label: t("products") },
    { name: "plans", icon: ClipboardList, label: t("plans") || "Plans" },
    { name: "revenueops", icon: TrendingUp, label: "RevenueOps" },
    { name: "settings", icon: Settings, label: t("settings") },
    { name: "inquiries", icon: MessageSquare, label: t("inquiries") },
  ] : role === "trainer" ? [
    { name: "dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { name: "users", icon: Users, label: t("users") },
    { name: "attendance", icon: Calendar, label: t("attendance") },
  ] : [
    { name: "dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { name: "subscription", icon: CreditCard, label: t("subscription") },
    { name: "attendance", icon: Users, label: t("attendance") },
    { name: "payments", icon: CreditCard, label: t("payments") },
    { name: "products", icon: Box, label: t("products") },
  ];

  const { publicAppConfig } = useGymStore();

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      initial={false}
      className="relative flex h-full flex-col rounded-3xl border border-gold-400/30 bg-white/80 backdrop-blur-xl p-4 overflow-x-hidden select-none shadow-elegant"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`mb-8 flex ${collapsed ? "flex-col items-center gap-6" : "items-center justify-between gap-3"} transition-all duration-300`}
      >
        <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-3"}`}>
          <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-violet shadow-lg overflow-hidden relative">
            {publicAppConfig?.logo_image_path ? (
              <img src={publicAppConfig.logo_image_path} alt={publicAppConfig.brand_name} className="h-full w-full object-cover" />
            ) : (
              <>
                <Dumbbell size={22} className="text-white relative z-10" />
                <div className="absolute -top-1 -right-1 text-amber-400">
                  <Sparkles size={12} fill="currentColor" />
                </div>
              </>
            )}
          </div>
          {!collapsed && (
            <motion.span
              key="brand-name"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-lg tracking-tight text-slate-800"
            >
              {publicAppConfig?.brand_name || "ForgeFit"}
            </motion.span>
          )}
        </div>

        <button
          className={`${isMobile ? "inline-flex" : "hidden md:inline-flex"} h-9 w-9 items-center justify-center rounded-xl bg-cream-100 hover:bg-cream-200 text-slate-600 hover:text-slate-800 transition-all duration-200`}
          onClick={() => {
            if (isMobile && onClose) onClose();
            else setCollapsed(!collapsed);
          }}
        >
          {isMobile ? <X className="h-6 w-6" /> : <ChevronLeft size={20} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />}
        </button>
      </motion.div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-2 pr-1 custom-scrollbar">
        {links.map(({ name, icon: Icon, label }) => {
          const path = `/${role}/${name}`;
          const isActive = location.pathname === path;

          return (
            <NavLink
              key={name}
              to={path}
              onClick={() => { if (isMobile && onClose) onClose(); }}
              className={`relative flex ${collapsed ? "justify-center" : "items-center gap-3 px-4"} py-3 rounded-2xl transition-all duration-200 group overflow-hidden ${isActive ? "text-white" : "text-slate-600 hover:text-slate-800"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${currentTheme.primary} shadow-gold`}
                />
              )}

              <Icon size={20} className="relative z-10 shrink-0" />

              {!collapsed && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 capitalize text-sm font-semibold whitespace-nowrap">
                  {label}
                </motion.span>
              )}

              {collapsed && !isMobile && (
                <div className="fixed left-24 bg-white text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[1000] shadow-elegant border border-gold-400/20 translate-x-2 group-hover:translate-x-0">
                  {label}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-4 pt-4 border-t border-cream-200"
      >
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-red-50 text-slate-600 hover:text-red-600"
        >
          <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
          {!collapsed && <span className="text-sm font-semibold uppercase tracking-wider">{t("logout")}</span>}
        </button>
      </motion.div>
    </motion.aside>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, name: authName, id: userId, setUserData } = useAuthStore();
  const { publicAppConfig } = useGymStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const currentTheme = themes[currentThemeIndex];

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const res: any = await api.get(API_ENDPOINTS.USER.MY_DETAILS(userId));
        if (res && res.code === 200) setUserData(res);
      } catch (err) {
        console.error("Failed to sync user data", err);
      }
    };
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeMenu = () => setProfileMenuOpen(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [profileMenuOpen]);

  const cycleTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % themes.length);
  };

  return (
    <div className="relative h-screen min-h-screen overflow-hidden overflow-x-hidden text-slate-800">
      <Helmet>
        <title>{`${role === 'admin' ? 'Admin' : role === 'trainer' ? 'Trainer' : 'Member'} Portal | ${publicAppConfig?.brand_name || 'ForgeFit'}`}</title>
      </Helmet>

      {/* Elegant Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream-50 via-pearl-100 to-cream-200" />

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[90] bg-slate-900/20 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="flex h-full gap-4 p-3 lg:p-6">
        <div className={`fixed inset-y-0 left-0 z-[100] w-[280px] transform transition-transform duration-300 lg:relative lg:w-auto lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-full p-2 lg:p-0">
            <Sidebar currentTheme={currentTheme} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-1 flex-col gap-4 min-w-0 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-[60] rounded-2xl border border-gold-400/20 bg-white/80 backdrop-blur-xl p-2 md:p-3 shadow-elegant"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100 border border-cream-200 hover:bg-cream-200 lg:hidden shrink-0 transition-colors"
                >
                  <Menu size={20} className="text-slate-600" />
                </button>

                <div className="flex items-center gap-2 rounded-2xl bg-cream-50 px-3 py-2 border border-cream-200">
                  <button
                    type="button"
                    onClick={cycleTheme}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/30 bg-gradient-to-r from-gold-400 to-gold-500 text-white hover:scale-110 transition-all shadow-gold"
                    title={`Switch to ${themes[(currentThemeIndex + 1) % themes.length].name}`}
                  >
                    <Palette size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 overflow-visible shrink-0">
                <div className="flex shrink-0">
                  <LanguageSwitcher />
                </div>

                <div className="relative">
                  <motion.div
                    onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(!profileMenuOpen); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-2 rounded-2xl border border-gold-400/20 bg-white shadow-md pl-2 pr-4 py-1.5 cursor-pointer transition-all duration-300 hover:border-gold-400/40 hover:shadow-gold"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shadow-md">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[100px]">
                        {authName || role || "Account"}
                      </span>
                      <span className="text-xs font-medium text-slate-400 uppercase">
                        {role === "admin" ? "Admin" : "Active"}
                      </span>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-gold-400/20 shadow-elegant-lg p-3 z-[1000]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-3 border-b border-cream-200 mb-2">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{authName || "User Account"}</p>
                        </div>

                        <div className="space-y-1">
                          <button
                            onClick={() => { navigate(`/${role}/profile`); setProfileMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-50 text-slate-600 hover:text-slate-800 transition-colors"
                          >
                            <User size={16} className="text-accent-indigo" />
                            <span className="text-sm font-semibold">My Profile</span>
                          </button>

                          <button
                            onClick={() => { navigate(`/${role}/change-password`); setProfileMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-50 text-slate-600 hover:text-slate-800 transition-colors"
                          >
                            <Settings size={16} className="text-gold-500" />
                            <span className="text-sm font-semibold">Change Password</span>
                          </button>
                        </div>

                        <div className="h-px bg-cream-200 my-3" />

                        <button
                          onClick={() => { logout(); navigate("/"); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <LogOut size={16} />
                          <span className="text-sm font-semibold">Log Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-gold-400/20 bg-white/60 backdrop-blur-xl shadow-inner"
          >
            <div className="custom-scrollbar h-full min-h-0 overflow-y-auto p-4 lg:p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardLayout;