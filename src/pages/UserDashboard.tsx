import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GlassCard,
  SectionTitle,
  GlowButton,
  Modal,
} from "../components/ui/primitives";

import { useAuthStore } from "../store/authStore";
import {
  CheckCircle2,
  Calendar,
  Zap,
  Dumbbell,
  AlertCircle,
  XCircle,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGet } from "../hooks/useApi";
import { api } from "../utils/httputils";
import confetti from "canvas-confetti";
import { API_ENDPOINTS } from "../utils/url";
import { toast } from "../store/toastStore";
import { IdCardModal } from "../components/common/IdCardModal";

function UserDashboard() {
  const { t } = useTranslation();
  const userName = useAuthStore((s) => s.name);
  const userId = useAuthStore((s) => s.id);
  const mobile = useAuthStore((s) => s.mobile);
  const email = useAuthStore((s) => s.email);
  const profile_image_path = useAuthStore((s) => s.profile_image_path);
  const metadata = useAuthStore((s) => s.metadata);
  const latest_subscription_details = useAuthStore((s) => s.latest_subscription_details);
  const userRole = useAuthStore((s) => s.role);
  const joining_date = useAuthStore((s) => s.joining_date);
  const username = useAuthStore((s) => s.username);
  const qr_url = useAuthStore((s) => s.qr_url);

  const myDetails = {
    mobile,
    email,
    profile_image_path,
    qr_url,
    metadata,
    latest_subscription_details,
    role: userRole,
    joining_date,
    username
  };
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [subscriptionPopupOpen, setSubscriptionPopupOpen] = useState(false);
  const [subscriptionPopupData, setSubscriptionPopupData] = useState<{
    subscription_name: string;
    remaining_days: number;
    message: string;
    show_popup: boolean;
  } | null>(null);
  const [popupLoaded, setPopupLoaded] = useState(false);
  const navigate = useNavigate();

  // Fetch subscription popup data FIRST
  useEffect(() => {
    if (!userId) return;
    
    const fetchPopup = async () => {
      try {
        const data = await api.get(API_ENDPOINTS.APP.SUBSCRIPTION_POPUP(userId), { showToast: false });
        if (data?.show_popup) {
          setSubscriptionPopupData(data);
          setSubscriptionPopupOpen(true);
        }
      } catch (err) {
        console.error("Popup fetch error:", err);
      } finally {
        setPopupLoaded(true);
      }
    };
    
    fetchPopup();
  }, [userId]);

  // Auto-sync plan on home mount (only after popup loaded)
  const { refetch: syncUserPlan } = useGet(
    userId && popupLoaded ? `${API_ENDPOINTS.ADMIN.SYNC_SUBSCRIPTIONS}?user_id=${userId}` : null,
    {
      onSuccess: () => {
        toast.success("Subscription plan synchronized.");
        setIsSyncing(false);
      },
      onError: () => {
        setIsSyncing(false);
      }
    }
  );

  // Active plan fetch — /current-subscription/{userId} (only after popup loaded)
  const { data: activePlanRes, loading: planLoading } = useGet(
    userId && popupLoaded ? API_ENDPOINTS.APP.CURRENT_SUBSCRIPTION(userId) : null,
    { useCache: true }
  );
  const activePlanData =
    activePlanRes?.data?.[0] ??
    (activePlanRes?.start_date != null ? activePlanRes : null);

  // Consistency Tracker fetch — /consistency-tracker/{userId} (only after popup loaded)
  const { data: trackerRes, loading: trackerLoading } = useGet(
    userId && popupLoaded ? API_ENDPOINTS.APP.CONSISTENCY_TRACKER(userId) : null,
    { useCache: true }
  );
  const trackerData = trackerRes || {};

  const handleManualSync = () => {
    setIsSyncing(true);
    syncUserPlan();
  };

  const trackerDays = trackerData.days || [];

  // Use .filter() to find today's tracker entry from the consistency-tracker API
  const todayTrackerEntry = trackerDays.filter((day: any) => {
    const dateObj = new Date(day.date * 1000);
    return new Date().toLocaleDateString() === dateObj.toLocaleDateString();
  });
  const isPresentToday =
    todayTrackerEntry.length > 0 && todayTrackerEntry[0].attended === true;

  const todayDay = String(new Date().getDay() || 7);
  const [workoutDay, setWorkoutDay] = useState(todayDay);
  const [dietDay, setDietDay] = useState(todayDay);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [dietModalOpen, setDietModalOpen] = useState(false);

  const { data: workoutData, loading: workoutLoading } = useGet(
    userId ? API_ENDPOINTS.APP.MY_WORKOUT_PLAN(userId, workoutDay) : null,
    { useCache: true }
  );
  
  const { data: dietData, loading: dietLoading } = useGet(
    userId ? API_ENDPOINTS.APP.MY_DIET_PLAN(userId, dietDay) : null,
    { useCache: true }
  );

  const workoutPlan = workoutData;
  const dietPlan = dietData;

  const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Plan Dates
  const planInfo = activePlanData ? {
    startDate: new Date(activePlanData.start_date * 1000).toLocaleDateString(),
    expiryDate: new Date(activePlanData.end_date * 1000).toLocaleDateString(),
    daysRemaining: activePlanData.remaining_days,
    name: activePlanData.subscription_name,
    status: activePlanData.status
  } : {
    startDate: "-",
    expiryDate: "-",
    daysRemaining: 0,
    name: "No Active Plan",
    status: false
  };

  // Subscription expired when status === false
  const isExpired = planInfo.status === false;

  // Calendar Data
  const monthName = trackerData.month ? new Date(trackerData.year, trackerData.month - 1).toLocaleString('default', { month: 'long' }).toUpperCase() : "";
  const yearName = trackerData.year || "";
  const firstDayOfMonth = trackerDays.length > 0 ? new Date(trackerDays[0].date * 1000).getDay() : 0;
  
  // Set expiry modal if needed
  useEffect(() => {
    if (planInfo.daysRemaining > 0 && planInfo.daysRemaining <= 5) {
      setShowExpiryModal(true);
    }
  }, [planInfo.daysRemaining]);

  const toggleExercise = (idx: number) => {
    if (completedExercises.includes(idx)) {
      setCompletedExercises(prev => prev.filter(i => i !== idx));
    } else {
      setCompletedExercises(prev => [...prev, idx]);
    }
  };

  const allDone = workoutPlan?.workout_details?.workouts?.length > 0 && 
    completedExercises.length === workoutPlan.workout_details.workouts.length;

  const handleCompleteSession = () => {
    setSessionCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#f97316", "#10b981"]
    });
  };

  // Shimmer skeleton block
  const Sk = ({ cls }: { cls: string }) => (
    <div className={`animate-pulse bg-[var(--bg-secondary)] rounded-xl ${cls}`} />
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SectionTitle
          title={`${t("welcomeBack")}, ${userName?.split(' ')[0] || "Member"}`}
          subtitle={t("trackConsistency")}
        />
        <div className="flex flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <GlowButton
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-all shadow-lg"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin shrink-0" : "shrink-0"} />
            <span className="truncate">{isSyncing ? "Syncing..." : "Re-sync"}</span>
          </GlowButton>
          
          <GlowButton
            onClick={() => setIdCardOpen(true)}
            className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-indigo-100 border-indigo-500/20 hover:bg-indigo-500 hover:text-[var(--text-primary)] transition-all shadow-lg shadow-indigo-500/10"
          >
            <QrCode size={18} className="shrink-0" />
            <span className="truncate">{t("profile")} ID</span>
          </GlowButton>
        </div>
      </div>

      {/* --- TODAY WORKOUT & DIET PLANS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Workout Plan */}
        <GlassCard className="p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Dumbbell size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">Today's Workout Plan</h3>
            </div>
            <select
              value={workoutDay}
              onChange={(e) => setWorkoutDay(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:border-indigo-500 outline-none"
            >
              {dayNames.map((day, i) => i > 0 && <option key={i} value={String(i)}>{day}</option>)}
            </select>
          </div>
          {workoutLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
            </div>
          ) : workoutPlan?.workout_details?.workouts?.length > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Plan Name</p>
                <p className="text-lg font-bold text-[var(--text-primary)] italic">{workoutPlan.name || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Focus</p>
                <p className="text-sm font-bold text-indigo-600">{workoutPlan.focus || "-"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Exercises</p>
                {workoutPlan.workout_details.workouts.map((ex: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => toggleExercise(idx)}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg border cursor-pointer transition-all ${
                      completedExercises.includes(idx)
                        ? "bg-emerald-100 border-emerald-500/30"
                        : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-indigo-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                        completedExercises.includes(idx) 
                          ? "bg-emerald-500 text-[var(--text-primary)]" 
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                      }`}>
                        {completedExercises.includes(idx) ? "✓" : (idx + 1)}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${completedExercises.includes(idx) ? "text-emerald-600 line-through" : "text-[var(--text-primary)]"}`}>{ex.name}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">{ex.target_body_part}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-indigo-600">{ex.no_of_sets} Sets</p>
                      <p className="text-[9px] text-[var(--text-muted)]">{ex.reps} Reps</p>
                    </div>
                  </div>
                ))}
              </div>
              {workoutPlan.workout_details.workouts.length > 0 && (
                <>
                  <button
                    onClick={handleCompleteSession}
                    disabled={sessionCompleted || !allDone}
                    className={`w-full mt-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      sessionCompleted
                        ? "bg-emerald-100 text-emerald-600 border border-emerald-500/30"
                        : allDone
                          ? "bg-indigo-500 hover:bg-indigo-400 text-[var(--text-primary)] shadow-lg shadow-indigo-500/20"
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)] opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {sessionCompleted ? (
                      <><CheckCircle2 size={16} /> Session Complete</>
                    ) : (
                      <><Zap size={16} fill="currentColor" /> {allDone ? "Complete Session" : "Mark All Exercises"}</>
                    )}
                  </button>
                  <button
                    onClick={() => setWorkoutModalOpen(true)}
                    className="w-full mt-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] transition-all"
                  >
                    View All Details
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-lg font-bold text-[var(--text-secondary)] uppercase italic">Break</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">No workout assigned for {dayNames[parseInt(workoutDay)]}</p>
            </div>
          )}
        </GlassCard>

        {/* Today's Diet Plan */}
        <GlassCard className="p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Zap size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">Today's Diet Plan</h3>
            </div>
            <select
              value={dietDay}
              onChange={(e) => setDietDay(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:border-emerald-500 outline-none"
            >
              {dayNames.map((day, i) => i > 0 && <option key={i} value={String(i)}>{day}</option>)}
            </select>
          </div>
          {dietLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
            </div>
          ) : dietPlan?.diet_details?.foods?.length > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Plan Name</p>
                <p className="text-lg font-bold text-[var(--text-primary)] italic">{dietPlan.name || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Focus</p>
                <p className="text-sm font-bold text-emerald-600">{dietPlan.focus || "-"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Meals</p>
                {dietPlan.diet_details.foods.map((food: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 px-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{food.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-emerald-600">{food.weight}</p>
                    </div>
                  </div>
                ))}
              </div>
              {dietPlan.diet_details.foods.length > 0 && (
                <button
                  onClick={() => setDietModalOpen(true)}
                  className="w-full mt-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] transition-all"
                >
                  View All Details
                </button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-lg font-bold text-[var(--text-secondary)] uppercase italic">Break</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">No diet assigned for {dayNames[parseInt(dietDay)]}</p>
            </div>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- PLAN STATUS --- */}
        {planLoading ? (
          <GlassCard className="p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <Sk cls="h-10 w-10" />
              <Sk cls="h-6 flex-1" />
              <Sk cls="h-7 w-20 rounded-full" />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Sk cls="h-20" />
                <Sk cls="h-20" />
              </div>
              <Sk cls="h-20" />
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Zap size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight flex-1 min-w-[120px] truncate">
                {t("activePlan")} {planInfo.name !== "No Active Plan" && `- ${planInfo.name}`}
              </h3>
              <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${planInfo.status ? "bg-emerald-100 text-emerald-600 border-emerald-500/20" : "bg-red-100 text-red-600 border-red-500/20"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${planInfo.status ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                {planInfo.status ? "Active" : "Expired"}
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Start Date</p>
                  <p className="text-lg font-bold text-[var(--text-primary)] italic tracking-tighter">{planInfo.startDate}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Expiry Date</p>
                  <p className="text-lg font-bold text-orange-600 italic tracking-tighter">{planInfo.expiryDate}</p>
                </div>
              </div>
              <div className={`relative h-20 rounded-2xl shadow-lg flex items-center justify-between px-8 overflow-hidden ${isExpired ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-red-500/20" : "bg-indigo-500 shadow-indigo-500/20"}`}>
                <div className="absolute top-0 right-0 w-32 h-full bg-[var(--bg-secondary)] -skew-x-12 translate-x-8" />
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{isExpired ? "Plan Expired" : "Remaining Days"}</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] italic tracking-tighter">{isExpired ? "0 Days" : `${planInfo.daysRemaining} Days`}</p>
                </div>
                <Zap size={32} className="text-[var(--text-muted)]" />
              </div>
            </div>
          </GlassCard>
        )}

        {/* --- ATTENDANCE STATUS --- */}
        {trackerLoading || planLoading ? (
          <GlassCard className="p-8 border-[var(--border-subtle)] flex flex-col items-center justify-center gap-6">
            <Sk cls="h-24 w-24 rounded-full" />
            <Sk cls="h-8 w-48" />
            <Sk cls="h-4 w-40" />
            <Sk cls="h-14 w-full rounded-2xl" />
          </GlassCard>
        ) : (
          <GlassCard className={`p-8 border-[1px] flex flex-col justify-center text-center transition-all ${isExpired ? "border-orange-500/20 bg-orange-500/5 shadow-lg shadow-orange-500/5" : isPresentToday ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5 shadow-lg shadow-red-500/5"}`}>
            <div className="mb-6">
              <div className={`h-24 w-24 mx-auto rounded-full flex items-center justify-center transition-all duration-700 shadow-xl ${isExpired ? "bg-orange-500 text-[var(--text-primary)] shadow-orange-500/20" : isPresentToday ? "bg-emerald-500 text-[var(--text-primary)] shadow-emerald-500/20" : "bg-red-500 text-[var(--text-primary)] shadow-red-500/20 animate-pulse"}`}>
                {isExpired ? <AlertCircle size={48} /> : isPresentToday ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </div>
              <h3 className="mt-6 text-3xl font-bold text-[var(--text-primary)] uppercase italic tracking-tighter">
                {isExpired ? "Plan Expired" : isPresentToday ? t("verifiedPresent") : t("markedAbsent")}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-2 font-medium">Official Registry Status for Today</p>
            </div>
            {isExpired ? (
              <div className="space-y-3">
                <div className="py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border bg-orange-100 text-orange-600 border-orange-500/20">Subscription Expired • Access Restricted</div>
                <p className="text-xs text-[var(--text-muted)] italic leading-relaxed px-2">Your membership plan has expired. Please renew your subscription to regain gym access.</p>
              </div>
            ) : (
              <div className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border ${isPresentToday ? "bg-emerald-100 text-emerald-600 border-emerald-500/20" : "bg-red-100 text-red-600 border-red-500/20"}`}>
                {isPresentToday ? "Scan Complete • Access Granted" : "Awaiting Scanner Authentication"}
              </div>
            )}
          </GlassCard>
        )}
      </div>

      {/* --- ATTENDANCE CALENDAR --- */}
      {trackerLoading ? (
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <Sk cls="h-10 w-10" />
            <Sk cls="h-6 w-56" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => <Sk key={i} cls="h-4 mb-2" />)}
            {Array.from({ length: 35 }).map((_, i) => <Sk key={i} cls="aspect-square" />)}
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <Calendar size={20} />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight">{t("consistencyTracker")} <span className="text-[var(--text-secondary)] ml-2">{monthName} {yearName}</span></h3>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">{day}</div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {trackerDays.map((dayData: any) => {
              const dateObj = new Date(dayData.date * 1000);
              const day = dateObj.getDate();
              const wasPresent = dayData.attended;
              const isToday = new Date().toLocaleDateString() === dateObj.toLocaleDateString();
              return (
                <div key={day} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${(isToday && wasPresent) || wasPresent ? "bg-emerald-100 border-emerald-500/40 text-emerald-600" : isToday ? "bg-indigo-100 border-indigo-500/40 text-indigo-600 animate-pulse" : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]"}`}>
                  {day}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* 🚨 CRITICAL ALERT MODAL */}
      <Modal
        open={showExpiryModal}
        onClose={() => setShowExpiryModal(false)}
        title="Protocol Termination Warning"
      >
        <div className="space-y-6 text-center py-4">
          <div className="h-20 w-20 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-orange-600 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <AlertCircle size={48} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-[var(--text-primary)] italic uppercase tracking-tighter">Membership Cycle Expiring</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed px-6">
              Your current access protocol is scheduled to terminate in <span className="text-orange-600 font-bold">{planInfo.daysRemaining} days</span>. Please process renewal to maintain continuity.
            </p>
          </div>
          <GlowButton className="w-full h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Execute Immediate Renewal</GlowButton>
        </div>
      </Modal>

      {/* 🆔 DIGITAL IDENTITY MODAL */}
      <IdCardModal
        isOpen={idCardOpen}
        onClose={() => setIdCardOpen(false)}
        user={{ id: userId || '', name: userName || '', ...myDetails }}
        portalType="user"
      />

      {/* WORKOUT PLAN MODAL */}
      <Modal
        open={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        title={`${workoutPlan?.name || "Workout Plan"} - ${dayNames[parseInt(workoutDay)]}`}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
              onClick={() => setWorkoutModalOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {workoutPlan?.workout_details?.workouts?.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Type</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{workoutPlan.type || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Focus</p>
                  <p className="text-sm font-bold text-indigo-600">{workoutPlan.focus || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Description</p>
                <p className="text-sm text-[var(--text-secondary)]">{workoutPlan.description || "-"}</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Exercises</p>
                {workoutPlan.workout_details.workouts.map((ex: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => toggleExercise(idx)}
                    className={`flex justify-between items-center py-3 px-4 rounded-xl border cursor-pointer transition-all ${
                      completedExercises.includes(idx)
                        ? "bg-emerald-100 border-emerald-500/30"
                        : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-indigo-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                        completedExercises.includes(idx) 
                          ? "bg-emerald-500 text-[var(--text-primary)]" 
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                      }`}>
                        {completedExercises.includes(idx) ? "✓" : (idx + 1)}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${completedExercises.includes(idx) ? "text-emerald-600 line-through" : "text-[var(--text-primary)]"}`}>{ex.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{ex.target_body_part}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-indigo-600">{ex.no_of_sets} Sets</p>
                      <p className="text-xs text-[var(--text-muted)]">{ex.reps} Reps</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xl font-bold text-[var(--text-secondary)] uppercase italic">Break</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">No workout assigned for {dayNames[parseInt(workoutDay)]}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* DIET PLAN MODAL */}
      <Modal
        open={dietModalOpen}
        onClose={() => setDietModalOpen(false)}
        title={`${dietPlan?.name || "Diet Plan"} - ${dayNames[parseInt(dietDay)]}`}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
              onClick={() => setDietModalOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {dietPlan?.diet_details?.foods?.length > 0 ? (
            <>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Focus</p>
                <p className="text-sm font-bold text-emerald-600">{dietPlan.focus || "-"}</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Meals</p>
                {dietPlan.diet_details.foods.map((food: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-3 px-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{food.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">{food.weight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xl font-bold text-[var(--text-secondary)] uppercase italic">Break</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">No diet assigned for {dayNames[parseInt(dietDay)]}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* SUBSCRIPTION POPUP */}
      <Modal
        open={subscriptionPopupOpen}
        onClose={() => setSubscriptionPopupOpen(false)}
        title="Subscription Alert"
        footer={
          <div className="flex gap-3 justify-center w-full">
            <button
              onClick={() => {
                setSubscriptionPopupOpen(false);
                navigate("/user/subscription");
              }}
              className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-indigo-500 hover:bg-indigo-400 text-[var(--text-primary)] transition-all flex items-center gap-2"
            >
              <Zap size={16} />
              Renew Now
            </button>
            <button
              onClick={() => setSubscriptionPopupOpen(false)}
              className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] transition-all"
            >
              Got It
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/20">
              <AlertCircle size={48} className="text-[var(--text-primary)]" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-[var(--text-primary)] uppercase italic tracking-tighter mb-2">
            {subscriptionPopupData?.subscription_name || "Subscription"}
          </h3>
          
          {subscriptionPopupData?.remaining_days !== undefined && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-500/30 rounded-xl mb-4">
              <span className="text-3xl font-bold text-amber-600">{subscriptionPopupData.remaining_days}</span>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Days Remaining</span>
            </div>
          )}
          
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed px-4">
            {subscriptionPopupData?.message || "Your subscription is active. Keep up the great work!"}
          </p>
          
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Renew early to avoid interruption
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UserDashboard;
