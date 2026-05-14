import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Clock, QrCode, Dumbbell, Sparkles } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../utils/url";
import { SectionTitle, GlowButton, GlassCard } from "../../components/ui/primitives";
import { IdCardModal } from "../../components/common/IdCardModal";

export function TrainerDashboard() {
  const { name, id: userId, mobile, email, profile_image_path, metadata, joining_date, username, qr_url, role } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const myDetails = { mobile, email, profile_image_path, qr_url, metadata, role, joining_date, username };
  const [idCardOpen, setIdCardOpen] = useState(false);

  const { data: statsData } = useGet(
    userId ? API_ENDPOINTS.ADMIN.TRAINER_STATS(userId) : null,
    { useCache: true }
  );
  
  const stats = statsData || { total_assigned_users: 0, new_assigned_users: 0, avg_session_time_minutes: 0 };

  const formatSessionTime = (minutes: number) => {
    if (!minutes || minutes === 0) return "0m";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const { data: trainerUsersData } = useGet(
    userId ? `${API_ENDPOINTS.ADMIN.TRAINER_USERS}?count=100&offset=0` : null,
    { useCache: true }
  );
  const trainerUsers = trainerUsersData?.data || [];
  
  const [selectedWorkoutUser, setSelectedWorkoutUser] = useState<string>("");
  
  useEffect(() => {
    if (trainerUsers.length > 0 && !selectedWorkoutUser) {
      setSelectedWorkoutUser(trainerUsers[0].id);
    }
  }, [trainerUsers, selectedWorkoutUser]);

  const todayDay = String(new Date().getDay() || 7);
  const [workoutDay, setWorkoutDay] = useState(todayDay);
  const { data: workoutData, loading: workoutLoading } = useGet(
    selectedWorkoutUser ? API_ENDPOINTS.APP.MY_WORKOUT_PLAN(selectedWorkoutUser, workoutDay) : null,
    { useCache: true }
  );
  const workoutPlan = workoutData;
  const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SectionTitle
          title={`${t("welcomeBack")}, COACH ${name?.split(' ')[0] || ""}`}
          subtitle="Trainer Portal"
        />
        <div className="flex flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <GlowButton
            onClick={() => setIdCardOpen(true)}
            className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500 hover:text-[var(--text-primary)] transition-all"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <QrCode size={18} className="shrink-0" />
            <span className="truncate">{t("profile")} ID</span>
          </GlowButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Total Assigned Users", value: stats.total_assigned_users, icon: Users, color: "bg-indigo-500", delay: 0.1, action: () => navigate("/trainer/users") },
          { label: "Avg Session Time", value: formatSessionTime(stats.avg_session_time_minutes), icon: Clock, color: "bg-purple-500", delay: 0.2, action: null },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: stat.delay }}
            onClick={stat.action || undefined}
            className={`group relative overflow-hidden rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 hover:border-[var(--accent-orange)] transition-all ${stat.action ? "cursor-pointer" : ""}`}
          >
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 ${stat.color}`} />
            <div className={`h-10 w-10 rounded-xl ${stat.color} bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} className="text-[var(--text-primary)]" />
            </div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">User Training Protocols</h3>
              <p className="text-xs text-[var(--text-muted)]">View user-specific workout plans</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedWorkoutUser}
              onChange={(e) => setSelectedWorkoutUser(e.target.value)}
              className="flex-1 md:w-48 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] font-bold focus:border-indigo-500 outline-none"
            >
              <option value="" disabled>Select User</option>
              {trainerUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <select
              value={workoutDay}
              onChange={(e) => setWorkoutDay(e.target.value)}
              className="w-32 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] font-bold focus:border-indigo-500 outline-none"
            >
              {dayNames.map((day, i) => i > 0 && <option key={i} value={String(i)}>{day}</option>)}
            </select>
          </div>
        </div>

        {workoutLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
            <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
          </div>
        ) : workoutPlan?.workout_details?.workouts?.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Plan Name</p>
                <p className="text-base font-bold text-[var(--text-primary)] italic">{workoutPlan.name || "-"}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Focus</p>
                <p className="text-sm font-bold text-indigo-600">{workoutPlan.focus || "-"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Exercises</p>
              {workoutPlan.workout_details.workouts.map((ex: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-center py-2 px-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{ex.name}</p>
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
          </div>
        ) : (
          <div className="py-12 text-center border-t border-[var(--border-subtle)] mt-4">
            <p className="text-lg font-bold text-[var(--text-secondary)] uppercase italic">Rest Day</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">No workout assigned for {dayNames[parseInt(workoutDay)]}</p>
          </div>
        )}
      </GlassCard>

      <IdCardModal
        isOpen={idCardOpen}
        onClose={() => setIdCardOpen(false)}
        user={{ id: userId || '', name: name || '', ...myDetails }}
        portalType="trainer"
      />
    </div>
  );
}
