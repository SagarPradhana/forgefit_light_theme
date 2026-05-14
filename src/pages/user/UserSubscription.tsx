import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGymStore } from "../../store/gymStore";
import { 
  GlassCard, 
  SectionTitle, 
  Skeleton, 
  EmptyState, 
  Modal, 
  GlowButton,
  StatusBadge 
} from "../../components/ui/primitives";
import { Clock, Star, ShieldCheck, Zap, Info, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { appSubscriptionService, type AppSubscriptionPlanResponse, type AppCurrentSubscriptionResponse, type AppSubscriptionHistoryResponse } from "../../services/appSubscriptionService";
import { appInquiryService } from "../../services/appInquiryService";
import { SubscriptionCard } from "../SubscriptionCard";
import { getCurrencySymbol } from "../../utils/currency";
import { toast } from "../../store/toastStore";

export function UserSubscription() {
  const { t } = useTranslation();
  const { appConfig } = useGymStore();
  const currencySymbol = getCurrencySymbol(appConfig?.currency || "INR");
  const { id: userId } = useAuthStore();
  const location = useLocation();

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any>(null);
  const [fetchedSubscriptionPlans, setFetchedSubscriptionPlans] = useState<AppSubscriptionPlanResponse[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<AppCurrentSubscriptionResponse | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<AppSubscriptionHistoryResponse[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [upgradeDescription, setUpgradeDescription] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<"" | "active" | "expired">("");

  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      setSubscriptionsLoading(false);
      return;
    }
    setSubscriptionsLoading(true);
    try {
      const [plansRes, currentRes, historyRes] = await Promise.all([
        appSubscriptionService.getSubscriptionPlans({ is_deleted: false, count: 100 }),
        appSubscriptionService.getCurrentSubscription(userId),
        appSubscriptionService.getSubscriptionHistory(userId, { count: 100 })
      ]);
      if (plansRes && plansRes.data) setFetchedSubscriptionPlans(plansRes.data);
      
      if (currentRes && currentRes.id) {
        setCurrentSubscription(currentRes as unknown as AppCurrentSubscriptionResponse);
      } else if (currentRes && currentRes.data && currentRes.data.length > 0) {
        const activeSub = currentRes.data.find((sub: any) => sub.user_id === userId) || currentRes.data[0];
        setCurrentSubscription(activeSub);
      } else {
        setCurrentSubscription(null);
      }
      
      if (historyRes && historyRes.data) setSubscriptionHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubscriptionsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("history") === "1") {
      setHistoryModalOpen(true);
    }
  }, [location.search]);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlanForUpgrade(plan);
    setUpgradeOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!userId || !selectedPlanForUpgrade) return;
    try {
      await appInquiryService.createSubscriptionInquiry({
        user_id: userId,
        subscription_plan_id: selectedPlanForUpgrade.id,
        description: upgradeDescription || `Requesting plan transition to ${selectedPlanForUpgrade.name}`
      });
      toast.success(`Request for ${selectedPlanForUpgrade.name} plan sent successfully! Our team will process it shortly.`);
      setUpgradeOpen(false);
      setUpgradeDescription("");
    } catch (err) {
      toast.error("Failed to submit request.");
    }
  };

  const currentPlanName = currentSubscription?.subscription_name;
  const currentDuration = currentSubscription?.duration_in_months ? `${currentSubscription.duration_in_months} Months` : "N/A";
  const fmtDate = (ts: number | null | undefined) =>
    ts ? new Date(Number(ts) * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionTitle
          title={t("subscription")}
          subtitle={t("membershipCycle")}
        />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            <ShieldCheck size={14} className="text-emerald-600" /> Auto-Renewal Enabled
          </div>
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="px-4 h-10 flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:bg-indigo-600 hover:border-indigo-600 text-indigo-600 hover:text-[var(--text-primary)] transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
            title="Subscription History"
          >
            <Clock size={16} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* --- ACTIVE STRATEGY BANNER --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-1 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-orange-500/20 shadow-2xl"
      >
        <div className="bg-[var(--bg-primary)] backdrop-blur-2xl px-6 py-10 sm:px-10 sm:py-12 rounded-[1.8rem] sm:rounded-[2.3rem] border border-[var(--border-subtle)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] -mr-48 -mt-48" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8 relative z-10 w-full sm:w-auto">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-indigo-500 to-emerald-400 p-[3px] shadow-2xl shadow-indigo-500/30 shrink-0">
              <div className="h-full w-full bg-[var(--bg-primary)] rounded-[1.3rem] sm:rounded-[1.8rem] flex items-center justify-center">
                <Star size={32} className="text-[var(--text-primary)] sm:w-[40px] sm:h-[40px]" fill="currentColor" />
              </div>
            </div>
            <div>
              <p className="text-[9px] sm:text-[11px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-2 leading-none">Current Subscription</p>
              {currentSubscription ? (
                <>
                  <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] italic tracking-tighter leading-none mb-4">{currentPlanName}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
                    <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">
                      <Clock size={12} className="text-emerald-600 sm:w-[14px] sm:h-[14px]" /> Expires: {fmtDate(currentSubscription?.end_date)}
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">
                      <CheckCircle2 size={12} className="text-emerald-600 sm:w-[14px] sm:h-[14px]" /> Duration: {currentDuration}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-muted)] italic tracking-tighter leading-none mb-4">Not Available</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
                    <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold text-orange-600 uppercase tracking-widest whitespace-nowrap">
                      <Info size={12} className="sm:w-[14px] sm:h-[14px]" /> Please select a strategy from below
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {subscriptionsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {fetchedSubscriptionPlans.map((p) => (
            <SubscriptionCard
              key={p.id}
              plan={p}
              currentPlan={currentPlanName}
              highlight={p.price > 1000}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>
      )}

      <Modal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title={selectedPlanForUpgrade ? `Request: ${selectedPlanForUpgrade.name}` : "Upgrade Strategy"}
      >
        <div className="space-y-8 p-4">
          <div className="p-6 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Zap size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] mb-1 uppercase tracking-tight">Upgrade Confirmation</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                You are requesting to transition from <span className="text-[var(--text-primary)] font-bold">{currentPlanName}</span> to <span className="text-indigo-600 font-bold">{selectedPlanForUpgrade?.name || "a New Plan"}</span>.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Request Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-muted)]">Strategy Level</span>
                <span className="text-[var(--text-primary)] font-bold uppercase tracking-tighter">{selectedPlanForUpgrade?.name || "Inquiry Only"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-muted)]">Monthly Commitment</span>
                <span className="text-[var(--text-primary)] font-bold italic">{currencySymbol}{selectedPlanForUpgrade?.price || "0"}.00</span>
              </div>
              <div className="h-px bg-[var(--border-subtle)]" />
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] text-xs">Administrative Processing</span>
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">24-48 Hours</span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Additional Description</label>
              <textarea
                value={upgradeDescription}
                onChange={(e) => setUpgradeDescription(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] outline-none focus:border-indigo-500 min-h-[80px]"
                placeholder="Any specific requests?"
              />
            </div>
            <GlowButton
              className="w-full h-14 rounded-2xl text-xs font-bold uppercase tracking-widest"
              onClick={handleConfirmUpgrade}
            >
              Confirm Strategy Transition
            </GlowButton>
            <p className="text-[9px] text-center text-[var(--text-muted)] italic px-6">
              By confirming, you authorize our administrative team to process your plan change. Final billing will be adjusted on your next cycle.
            </p>
          </div>
        </div>
      </Modal>

      <Modal open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Subscription History">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-1">
            {([["", "All"], ["active", "Active"], ["expired", "Expired"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setHistoryStatusFilter(val)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  historyStatusFilter === val
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-[var(--text-primary)] shadow-lg"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-[55vh] overflow-y-auto">
            {subscriptionHistory.length === 0 ? (
              <EmptyState title="No History" hint="You don't have any past subscriptions." />
            ) : (() => {
              const filtered = subscriptionHistory.filter(h =>
                historyStatusFilter === "" ? true
                : historyStatusFilter === "active" ? h.status === true
                : h.status === false
              );
              return filtered.length === 0 ? (
                <EmptyState title="No Records" hint={`No ${historyStatusFilter} subscriptions found.`} />
              ) : (
                <div className="space-y-3">
                  {filtered.map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-indigo-500/20 transition-all group">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">
                          {(h as any).subscription_name || "Subscription"}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                          <span>{fmtDate(h.start_date)} → {fmtDate(h.end_date)}</span>
                          <span className="text-indigo-600">{h.duration_in_months} {h.duration_in_months === 1 ? "Month" : "Months"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-emerald-600">{currencySymbol}{Number(h.amount).toLocaleString("en-IN")}</span>
                        <StatusBadge status={h.status ? "Active" : "Expired"} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </Modal>
    </div>
  );
}
