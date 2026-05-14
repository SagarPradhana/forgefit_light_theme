import { useAuthStore } from "../../store/authStore";
import { GlassCard } from "../../components/ui/primitives";
import { CheckCircle2 } from "lucide-react";

export function AdminProfile() {
  const user = useAuthStore();
  const fmtDate = (ts: number | null) =>
    ts ? new Date(ts * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

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
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-2xl shadow-indigo-500/40">
                {user.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-indigo-500 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg">
              {user.role || "admin"}
            </span>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">{user.name}</h2>
            {user.username && <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.3em]">{user.username}</p>}
            <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">System Administrator</p>
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
            { label: "Full Name", value: user.name },
            { label: "Username", value: user.username },
            { label: "Email", value: user.email },
            { label: "Mobile", value: user.mobile },
            { label: "Address", value: user.address },
            { label: "Joining Date", value: fmtDate(user.joining_date) },
          ].map(({ label, value }) => (
            <div key={label} className="grid gap-0.5">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{label}</p>
              <p className="text-sm text-[var(--text-primary)] font-bold">{value || "—"}</p>
            </div>
          ))}
        </GlassCard>

        {/* System Privileges */}
        <GlassCard className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3">System Privileges</h3>
          <div className="space-y-3">
            {[
              "User Management & Registration",
              "Subscription Plan Control",
              "Revenue & Payment Oversight",
              "Attendance Monitoring",
              "Inventory & Product Management",
              "Inquiry Center Access",
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-indigo-500/30 transition-all group">
                <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-white transition-colors">{perm}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
