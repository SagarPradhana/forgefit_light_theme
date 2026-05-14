import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, CreditCard, Dumbbell, LayoutDashboard, LogOut, Palette, Settings, TrendingUp,
  User, Users, Menu, X, ClipboardList, Calendar, MessageSquare, Sparkles, ChevronDown,
  ChevronRight, DollarSign, ShoppingBag,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import { useGymStore } from "../store/gymStore";
import { api } from "../utils/httputils";
import { API_ENDPOINTS } from "../utils/url";
import { NavProvider, useNav } from "../contexts/NavContext";

const themes = [
  { id: "elegant", name: "Elegant Pearl", accent: "#d4a853" },
  { id: "rose", name: "Rose Gold", accent: "#e8c4b8" },
  { id: "sage", name: "Sage Luxury", accent: "#10b981" },
  { id: "violet", name: "Violet Royale", accent: "#8b5cf6" },
  { id: "gold", name: "Golden Luxe", accent: "#f59e0b" },
];

const containerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0 },
};

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { role, name: authName, id: userId, setUserData } = useAuthStore();
  const { publicAppConfig, dashboardColorTheme: colorTheme, setDashboardColorTheme: setColorTheme } = useGymStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const { groups: navGroups } = useNav();

  const currentTheme = themes.find((th) => th.id === colorTheme) || themes[0];
  const currentThemeIndex = themes.findIndex((th) => th.id === currentTheme.id);

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!openGroup) return;
    const handleClick = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    setTimeout(() => window.addEventListener("click", handleClick), 0);
    return () => window.removeEventListener("click", handleClick);
  }, [openGroup]);

  useEffect(() => {
    setMounted(true);
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
  }, [userId, setUserData]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeMenu = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".profile-menu")) setProfileMenuOpen(false);
    };
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [profileMenuOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const cycleTheme = () => {
    const nextIndex = (currentThemeIndex + 1) % themes.length;
    setColorTheme(themes[nextIndex].id as any);
  };

  const getRoleLabel = () => {
    if (role === "admin") return "Admin";
    if (role === "trainer") return "Trainer";
    return "Member";
  };

  const getRoleBadge = () => {
    if (role === "admin") return "bg-amber-100 text-amber-700";
    if (role === "trainer") return "bg-blue-100 text-blue-700";
    return "bg-emerald-100 text-emerald-700";
  };

  if (!mounted) return null;

  return (
    <div
      className="h-screen flex flex-col bg-[#f8f7f4] text-[var(--text-primary)]"
      style={{
        "--bg-card": "rgba(255, 255, 255, 0.95)",
        "--bg-card-hover": "rgba(255, 255, 255, 1)",
        "--bg-secondary": "rgba(249, 248, 246, 0.9)",
        "--border-subtle": "rgba(212, 168, 83, 0.2)",
        "--border-accent": currentTheme.accent,
        "--accent-orange": currentTheme.accent,
        "--accent-gold": currentTheme.accent + "dd", // Slightly transparent for gold effect
        "--glow-orange": `${currentTheme.accent}40`,
        "--shadow-card": "0 2px 16px rgba(0, 0, 0, 0.04)",
        "--shadow-hover": "0 8px 32px rgba(0, 0, 0, 0.08)",
        "--text-primary": "#1f1f2e",
        "--text-secondary": "#4a4a5a",
        "--text-muted": "#9a9aaa",
      } as React.CSSProperties}
    >
      <Helmet>
        <title>{`${getRoleLabel()} Portal | ${publicAppConfig?.brand_name || "ForgeFit"}`}</title>
      </Helmet>

      {/* Subtle background pattern */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#faf9f7] via-[#f5f4f1] to-[#f0efe9]" />

      {/* ═══ TOP NAVBAR ═══ */}
      <header className="shrink-0 z-50 border-b border-[var(--border-subtle)] bg-white/90 backdrop-blur-xl">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-[1600px] mx-auto">
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(`/${role}/dashboard`)}
              className="flex items-center gap-2.5 group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center overflow-hidden shadow-md transition-transform group-hover:scale-105">
                {publicAppConfig?.logo_image_path ? (
                  <img src={publicAppConfig.logo_image_path} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Dumbbell size={18} className="text-white" />
                )}
              </div>
              <span className="font-bold text-lg tracking-tight text-[var(--text-primary)] hidden sm:block">
                {publicAppConfig?.brand_name || "ForgeFit"}
              </span>
            </button>
            <span className={`hidden md:inline-flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getRoleBadge()}`}>
              {getRoleLabel()}
            </span>
          </div>

          {/* Center: Multilevel Dropdown Nav - Desktop */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-4" ref={groupRef}>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {navGroups.map((group) => {
                const isOpen = openGroup === group.label;
                const isAnyActive = group.items.some(item => location.pathname === `/${role}/${item.name}`);
                return (
                  <div key={group.label} className="relative">
                    <button
                      onClick={() => setOpenGroup(isOpen ? null : group.label)}
                      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isAnyActive
                          ? "text-white bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <group.icon size={16} />
                      <span>{group.label}</span>
                      <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 min-w-[180px] rounded-2xl bg-white border border-[var(--border-subtle)] p-1.5 z-[60]"
                          style={{ boxShadow: "var(--shadow-hover)" }}
                        >
                          {group.items.map((item) => {
                            const path = `/${role}/${item.name}`;
                            const isActive = location.pathname === path;
                            const Icon = item.icon;
                            return (
                              <NavItemOrLink key={item.name} item={item} role={role} path={path} isActive={isActive} Icon={Icon} onClose={() => setOpenGroup(null)} />
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-all"
              title={`Theme: ${themes[(currentThemeIndex + 1) % themes.length].name}`}
            >
              <Palette size={16} className="text-[var(--accent-orange)]" />
            </button>

            {/* Language */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Profile */}
            <div className="relative profile-menu">
              <button
                onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(!profileMenuOpen); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-orange)] transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center">
                  <User size={15} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)] hidden sm:block max-w-[90px] truncate">
                  {authName || "Account"}
                </span>
                <ChevronDown size={14} className="text-[var(--text-muted)] hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[var(--border-subtle)] p-2 z-[100]"
                    style={{ boxShadow: "var(--shadow-hover)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-3 border-b border-[var(--border-subtle)] mb-1">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Account</p>
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{authName || "User"}</p>
                    </div>
                    <button
                      onClick={() => { navigate(`/${role}/profile`); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold"
                    >
                      <User size={16} className="text-[var(--accent-orange)]" />
                      My Profile
                    </button>
                    <button
                      onClick={() => { navigate(`/${role}/change-password`); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold"
                    >
                      <Settings size={16} className="text-[var(--accent-gold)]" />
                      Change Password
                    </button>
                    <div className="h-px bg-[var(--border-subtle)] my-1" />
                    <button
                      onClick={() => { logout(); navigate("/"); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors text-sm font-semibold"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile nav toggle */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-all"
            >
              <Menu size={18} className="text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-orange)] to-transparent opacity-40" />
      </header>

      {/* ═══ MOBILE OVERLAY NAV ═══ */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[100] w-[280px] bg-white border-r border-[var(--border-subtle)] p-4 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center">
                    {publicAppConfig?.logo_image_path ? (
                      <img src={publicAppConfig.logo_image_path} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Dumbbell size={18} className="text-white" />
                    )}
                  </div>
                  <span className="font-bold text-lg">{publicAppConfig?.brand_name || "ForgeFit"}</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-all"
                >
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{authName || "Account"}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${getRoleBadge().split(" ")[0]} ${getRoleBadge().split(" ")[1]}`}>
                    {getRoleLabel()}
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-4 py-2">{group.label}</p>
                    {group.items.map(({ name, icon: Icon, label }) => {
                      const path = `/${role}/${name}`;
                      const isActive = location.pathname === path;
                      return (
                        <NavLink
                          key={name}
                          to={path}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all text-sm font-semibold ${
                            isActive
                              ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                          }`}
                        >
                          <Icon size={18} />
                          {label}
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-sm font-semibold"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Bottom accent line */}
      <div className="shrink-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-orange)] to-transparent opacity-30" />
    </div>
  );
}

function NavItemOrLink({ item, role, path, isActive, Icon, onClose }: {
  item: import("../contexts/NavContext").NavItem; role: string | null; path: string; isActive: boolean;
  Icon: any; onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (!item.subItems || item.subItems.length === 0) {
    return (
      <NavLink to={path} onClick={onClose}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isActive ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        }`}
      >
        <Icon size={16} />
        {item.label}
      </NavLink>
    );
  }

  const subActive = item.subItems.some(s => {
    if (s.href) {
      const [p, q] = s.href.split("?");
      return location.pathname === p && location.search === `?${q || ""}`;
    }
    return false;
  });

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          subActive ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} />
          {item.label}
        </div>
        <ChevronRight size={14} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            className="pl-4 mt-0.5 space-y-0.5 border-l-2 border-[var(--border-subtle)] ml-3"
          >
            {item.subItems.map((sub) => {
              const SubIcon = sub.icon;
              const subHref = sub.href || `/${role}/${item.name}`;
              const [subPath, subQuery] = subHref.split("?");
              const isSubActive = location.pathname === subPath && (!subQuery || location.search === `?${subQuery}`);
              return (
                <NavLink key={sub.name} to={subHref}
                  onClick={() => { setOpen(false); onClose(); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSubActive ? "text-[var(--accent-orange)] bg-orange-50"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  <SubIcon size={14} />
                  {sub.label}
                </NavLink>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <DashboardInner>{children}</DashboardInner>
    </NavProvider>
  );
}

export default DashboardLayout;