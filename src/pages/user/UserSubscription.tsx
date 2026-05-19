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
import { Clock, BadgeDollarSign, ShieldCheck, Zap, Info, CheckCircle2 } from "lucide-react";
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
                <BadgeDollarSign size={32} className="text-[var(--text-primary)] sm:w-[40px] sm:h-[40px]" />
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
        title={selectedPlanForUpgrade ? `Upgrade to ${selectedPlanForUpgrade.name}` : "Upgrade Plan"}
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <Zap size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Upgrade Confirmation</p>
              <p className="text-xs text-gray-600 mt-0.5">
                You are requesting to upgrade from <span className="font-semibold text-gray-900">{currentPlanName}</span> to <span className="font-semibold text-indigo-600">{selectedPlanForUpgrade?.name || "a New Plan"}</span>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Details</h4>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plan Name</span>
                <span className="text-sm font-semibold text-gray-900">{selectedPlanForUpgrade?.name || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-sm font-semibold text-gray-900">{currencySymbol}{selectedPlanForUpgrade?.price || "0"}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Processing Time</span>
                <span className="text-xs font-semibold text-green-600">24-48 Hours</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea value={upgradeDescription} onChange={(e) => setUpgradeDescription(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none min-h-[80px]"
              placeholder="Any specific requests?" />
          </div>

          <GlowButton className="w-full h-12 rounded-lg text-sm font-semibold" onClick={handleConfirmUpgrade}>
            Confirm Upgrade
          </GlowButton>
          <p className="text-xs text-center text-gray-400">
            By confirming, you authorize our team to process your plan change. Final billing will be adjusted on your next cycle.
          </p>
        </div>
      </Modal>

      <Modal open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Subscription History">
        <div className="space-y-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {([["", "All"], ["active", "Active"], ["expired", "Expired"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setHistoryStatusFilter(val)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historyStatusFilter === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-[55vh] overflow-y-auto space-y-2">
            {subscriptionHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-medium text-gray-500">No History</p>
                <p className="text-xs text-gray-400 mt-1">No past subscriptions found.</p>
              </div>
            ) : (() => {
              const filtered = subscriptionHistory.filter(h =>
                historyStatusFilter === "" ? true
                  : historyStatusFilter === "active" ? h.status === true
                    : h.status === false
              );
              return filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-medium text-gray-500">No Records</p>
                </div>
              ) : (
                filtered.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-all">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{(h as any).subscription_name || "Subscription"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{fmtDate(h.start_date)} - {fmtDate(h.end_date)}</span>
                        <span className="text-xs font-medium text-indigo-600">{h.duration_in_months}m</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{currencySymbol}{Number(h.amount).toLocaleString("en-IN")}</p>
                      <StatusBadge status={h.status ? "Active" : "Expired"} />
                    </div>
                  </div>
                ))
              );
            })()}
          </div>
        </div>
      </Modal>
    </div>
  );
}
