import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { GlassCard } from "../../components/ui/primitives";
import { getCurrencySymbol } from "../../utils/currency";

export function UserProfile() {
  const user = useAuthStore();
  const { appConfig } = useGymStore();
  const currencySymbol = getCurrencySymbol(appConfig?.currency || "INR");
  
  const sub = user.latest_subscription_details;
  const fmtDate = (ts: number | null | undefined) =>
    ts ? new Date(Number(ts) * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero Card */}
      <GlassCard className="p-6 md:p-10 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
          <div className="relative shrink-0">
            {user.profile_image_path ? (
              <img src={user.profile_image_path} alt={user.name || ""}
                className="h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-3xl object-cover shadow-2xl shadow-indigo-500/30 border-2 border-indigo-500/30" />
            ) : (
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-3xl md:text-5xl font-bold text-[var(--text-primary)] shadow-2xl shadow-indigo-500/40">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-indigo-500 text-[9px] font-bold uppercase tracking-widest text-[var(--text-primary)] shadow-lg">
              {user.role || "member"}
            </span>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">{user.name}</h2>
            {user.username && <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.3em]">{user.username}</p>}
            <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Gym Member</p>
            {user.joining_date && (
              <p className="text-[10px] text-[var(--text-muted)] font-bold">
                Member since {fmtDate(user.joining_date)}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <GlassCard className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3">Contact Information</h3>
          {[
            { label: "Full Name",    value: user.name },
            { label: "Username",     value: user.username },
            { label: "Email",        value: user.email },
            { label: "Mobile",       value: user.mobile },
            { label: "Address",      value: user.address },
            { label: "Joining Date", value: fmtDate(user.joining_date) },
          ].map(({ label, value }) => (
            <div key={label} className="grid gap-0.5">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{label}</p>
              <p className="text-sm text-[var(--text-primary)] font-bold">{value || "—"}</p>
            </div>
          ))}
        </GlassCard>

        {/* Health & Vitals */}
        <GlassCard className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3">Health & Vitals</h3>
          <div className="space-y-3">
            {[
              { label: "Date of Birth",       value: fmtDate(user.metadata?.dob) },
              { label: "Gender",              value: user.metadata?.gender },
              { label: "Height",              value: user.metadata?.height ? `${user.metadata.height} cm` : null },
              { label: "Weight",              value: user.metadata?.weight ? `${user.metadata.weight} kg` : null },
              { label: "Fitness Goal",        value: user.metadata?.fitness_goal },
              { label: "Workout Time",        value: user.metadata?.workout_time },
              { label: "Medical Conditions",  value: user.metadata?.medical_conditions },
              { label: "Emergency Contact",   value: user.metadata?.emergency_contact },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-indigo-500/30 transition-all group">
                <div className="grid gap-0.5 flex-1">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{label}</p>
                  <p className="text-sm text-[var(--text-primary)] font-bold capitalize group-hover:text-indigo-600 transition-colors">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Active Subscription */}
      {sub && (
        <GlassCard className="p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3 mb-4">Active Subscription</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { label: "Plan",       value: sub.subscription_name },
              { label: "Duration",   value: sub.duration_in_months ? `${sub.duration_in_months} Months` : null },
              { label: "Amount",     value: sub.amount ? `${currencySymbol}${Number(sub.amount).toLocaleString("en-IN")}` : null },
              { label: "Start Date", value: fmtDate(sub.start_date) },
              { label: "End Date",   value: fmtDate(sub.end_date) },
              { label: "Status",     value: sub.status === true ? "Active" : sub.status === false ? "Inactive" : String(sub.status ?? "—") },
            ].map(({ label, value }) => (
              <div key={label} className="grid gap-0.5">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{label}</p>
                <p className="text-sm text-emerald-600 font-bold">{value || "—"}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
