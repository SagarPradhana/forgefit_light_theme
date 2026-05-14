import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { 
  Bell, 
  Lock, 
  User, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Zap, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  GlassCard, 
  CommonButton, 
  SectionTitle,
  InputField 
} from "../components/ui/primitives";
import { toast } from "../store/toastStore";

type TabType = "general" | "security" | "notifications";

export function SettingsPanel() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isPasswordOnly = searchParams.get("view") === "password";
  const [activeTab, setActiveTab] = useState<TabType>(isPasswordOnly ? "security" : "general");
  
  useEffect(() => {
    if (isPasswordOnly) {
      setActiveTab("security");
    }
  }, [isPasswordOnly]);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [prefs, setPrefs] = useState({
    workoutReminders: true,
    paymentAlerts: true,
    newsletters: false,
    publicProfile: true,
    twoFactor: false
  });

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success("Settings synchronized successfully");
  };

  const tabs = [
    { id: "general", label: t("general") || "General", icon: User },
    { id: "security", label: t("security") || "Security", icon: Lock },
    { id: "notifications", label: t("notifications") || "Alerts", icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* --- TAB NAVIGATION --- */}
      {!isPasswordOnly && (
        <div className="flex p-1.5 bg-[var(--bg-secondary)] backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl w-full sm:w-fit mx-auto sm:mx-0 overflow-x-auto no-scrollbar">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? "text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={14} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- CONTENT AREA --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {activeTab === "general" && (
            <div className="space-y-6">
              <GlassCard className="p-8">
                <SectionTitle 
                  title={t("profilePreferences")} 
                  subtitle={t("profilePreferencesSub")}
                  className="mb-8"
                />
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t("displayPrivacy")}</label>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] transition">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-emerald-500" />
                          <span className="text-sm font-bold text-[var(--text-primary)]">{t("publicProfile")}</span>
                        </div>
                        <ToggleButton active={prefs.publicProfile} onClick={() => handleToggle("publicProfile")} />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col justify-center items-center text-center">
                    <Zap className="text-indigo-600 mb-3" size={32} />
                    <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase mb-1">{t("quickSync")}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                      {t("quickSyncDesc")}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <GlassCard className="p-8">
                <SectionTitle 
                  title={isPasswordOnly ? t("changePassword") : t("securityVault")} 
                  subtitle={isPasswordOnly ? t("updateCredentials") : t("securityVaultSub")}
                  className="mb-8"
                />

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t("currentPassword")}</label>
                      <InputField 
                        type="password" 
                        placeholder="••••••••" 
                        value={passwords.current}
                        onChange={(val: any) => setPasswords({...passwords, current: val})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t("newPassword")}</label>
                      <InputField 
                        type="password" 
                        placeholder="••••••••" 
                        value={passwords.new}
                        onChange={(val: any) => setPasswords({...passwords, new: val})}
                      />
                    </div>
                    <div className="flex justify-start pt-2">
                      <CommonButton className="px-8 bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white text-xs font-bold uppercase tracking-widest rounded-xl">
                        {t("updateVault")}
                      </CommonButton>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="text-orange-600" size={18} />
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">{t("twoFactorAuth")}</h4>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mb-4 tracking-tight">{t("twoFactorDesc")}</p>
                      <button 
                        onClick={() => handleToggle("twoFactor")}
                        className={`w-full py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                          prefs.twoFactor 
                            ? "bg-emerald-100 text-emerald-600 border-emerald-300" 
                            : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]"
                        }`}
                      >
                        {prefs.twoFactor ? t("enabled") : t("enable2FA")}
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <GlassCard className="p-8">
                <SectionTitle 
                  title={t("alertMatrix")} 
                  subtitle={t("alertMatrixSub")}
                  className="mb-8"
                />

                <div className="space-y-4">
                  <NotificationRow 
                    icon={Zap} 
                    title={t("workoutReminders")} 
                    desc={t("workoutRemindersDesc")}
                    active={prefs.workoutReminders}
                    onToggle={() => handleToggle("workoutReminders")}
                    color="text-indigo-600"
                  />
                  <NotificationRow 
                    icon={Mail} 
                    title={t("paymentInvoices")} 
                    desc={t("paymentInvoicesDesc")}
                    active={prefs.paymentAlerts}
                    onToggle={() => handleToggle("paymentAlerts")}
                    color="text-emerald-600"
                  />
                  <NotificationRow 
                    icon={Smartphone} 
                    title={t("gymNewsletters")} 
                    desc={t("gymNewslettersDesc")}
                    active={prefs.newsletters}
                    onToggle={() => handleToggle("newsletters")}
                    color="text-amber-600"
                  />
                </div>
              </GlassCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* --- FOOTER ACTIONS --- */}
      {!isPasswordOnly && (
        <div className="flex items-center justify-between p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem]" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <AlertCircle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Auto-saved to local storage</span>
          </div>
          <CommonButton
            variant="secondary"
            onClick={handleSave}
            className="px-10 h-12 text-xs font-bold uppercase tracking-widest"
          >
            {t("confirmSync")}
          </CommonButton>
        </div>
      )}
    </div>
  );
}

// --- SMALL SUB-COMPONENTS ---

function ToggleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-500 ${
        active ? "bg-emerald-500" : "bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
      }`}
    >
      <motion.div
        animate={{ x: active ? 20 : 0 }}
        className="h-4 w-4 bg-white rounded-full shadow-md"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function NotificationRow({ icon: Icon, title, desc, active, onToggle, color }: any) {
  return (
    <div className="flex items-center justify-between p-5 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent-orange)] transition-all group">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={22} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight mb-0.5">{title}</h4>
          <p className="text-[10px] font-medium text-[var(--text-muted)] max-w-[250px] leading-relaxed">{desc}</p>
        </div>
      </div>
      <ToggleButton active={active} onClick={onToggle} />
    </div>
  );
}

