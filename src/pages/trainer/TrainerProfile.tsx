import { useAuthStore } from "../../store/authStore";
import { GlassCard } from "../../components/ui/primitives";

export function TrainerProfile() {
  const user = useAuthStore();
  const fmtDate = (ts: number | null | undefined) =>
    ts ? new Date(Number(ts) * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-4 md:space-y-6">
      <GlassCard className="p-6 md:p-10 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
          <div className="relative shrink-0">
            {user.profile_image_path ? (
              <img src={user.profile_image_path} alt={user.name || ""}
                className="h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-3xl object-cover border-2 border-indigo-500/30"
                style={{ boxShadow: "var(--shadow-card)" }} />
            ) : (
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-3xl md:text-5xl font-bold text-[var(--text-primary)]"
                style={{ boxShadow: "var(--shadow-card)" }}>
                {user.name?.[0]?.toUpperCase() || "T"}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-indigo-500 text-[9px] font-bold uppercase tracking-widest text-[var(--text-primary)]"
              style={{ boxShadow: "var(--shadow-card)" }}>
              {user.role || "trainer"}
            </span>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">{user.name}</h2>
            {user.username && <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.3em]">{user.username}</p>}
            <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Personal Trainer</p>
            {user.joining_date && (
              <p className="text-[10px] text-[var(--text-muted)] font-bold">
                Member since {fmtDate(user.joining_date)}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <GlassCard className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3">Professional Details</h3>
          {[
            { label: "Employee ID", value: user.id },
            { label: "Role", value: user.role },
            { label: "Specialization", value: user.metadata?.specialization },
            { label: "Experience", value: user.metadata?.experience ? `${user.metadata.experience} years` : null },
            { label: "Certifications", value: user.metadata?.certifications },
          ].map(({ label, value }) => (
            <div key={label} className="grid gap-0.5">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{label}</p>
              <p className="text-sm text-[var(--text-primary)] font-bold">{value || "—"}</p>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}
