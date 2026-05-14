import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { 
  GlassCard, 
  SectionTitle, 
  Skeleton, 
  EmptyState, 
  Table, 
  StatusBadge,
  Modal
} from "../../components/ui/primitives";
import { Calendar as CalendarIcon, List as ListIcon, Users, Clock, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { appAttendanceService, type AppAttendanceResponse, type AppAttendanceStatsResponse } from "../../services/appAttendanceService";
import { DateRangeFilter, type DateRange } from "../../components/ui/DateRangeFilter";
import { AttendanceCalendar } from "../AttendanceCalender";

export function UserAttendance() {
  const { t } = useTranslation();
  const { id: userId } = useAuthStore();
  
  const [view, setView] = useState<"table" | "calendar">("calendar");
  const [attDateRange, setAttDateRange] = useState<DateRange>({ label: "This Month" });
  const [fetchedAttendance, setFetchedAttendance] = useState<AppAttendanceResponse[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AppAttendanceStatsResponse | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [viewMoreAttendance, setViewMoreAttendance] = useState<AppAttendanceResponse[] | null>(null);

  const fetchUserAttendance = useCallback(async () => {
    if (!userId) return;
    setAttendanceLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        appAttendanceService.getAttendanceStats(userId, { from_date: attDateRange.from_date, to_date: attDateRange.to_date }),
        appAttendanceService.getAttendance(userId, { from_date: attDateRange.from_date, to_date: attDateRange.to_date })
      ]);
      if (statsRes) setAttendanceStats(statsRes);
      if (listRes && listRes.data) setFetchedAttendance(listRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  }, [userId, attDateRange]);

  useEffect(() => {
    fetchUserAttendance();
  }, [fetchUserAttendance]);

  const formatAttendanceForUI = (data: AppAttendanceResponse[]) => {
    const map = new Map<string, AppAttendanceResponse[]>();
    data.forEach(a => {
      const d = new Date(a.date * 1000).toISOString().split('T')[0];
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(a);
    });
    return Array.from(map.entries()).map(([date, records]) => {
      return {
        date,
        checkIn: new Date(records[0].check_in * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOut: records[0].check_out ? new Date(records[0].check_out * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---",
        records
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle
          title={t("attendance")}
          subtitle="Monitor your performance and consistency"
        />
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            defaultPreset="monthly"
            onChange={(r) => setAttDateRange(r)}
          />
          <div className="flex p-1 bg-[var(--bg-secondary)] backdrop-blur-md border border-[var(--border-subtle)] rounded-xl">
            <button
              onClick={() => setView("calendar")}
              className={`p-2.5 rounded-lg transition-all duration-300 relative group ${view === "calendar" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              title="Calendar View"
            >
              {view === "calendar" && (
                <motion.div layoutId="viewActive" className="absolute inset-0 bg-indigo-100 border border-indigo-200 rounded-lg" />
              )}
              <CalendarIcon size={18} className="relative z-10" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2.5 rounded-lg transition-all duration-300 relative group ${view === "table" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              title="List View"
            >
              {view === "table" && (
                <motion.div layoutId="viewActive" className="absolute inset-0 bg-indigo-100 border border-indigo-200 rounded-lg" />
              )}
              <ListIcon size={18} className="relative z-10" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Total visits</p>
            <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{attendanceStats?.total_visits || 0} <span className="text-[10px] text-emerald-600">Days</span></p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Avg Duration</p>
            <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{attendanceStats?.avg_duration_in_hrs || 0} <span className="text-[10px] text-indigo-600">Hours</span></p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Info size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Current Streak</p>
            <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{attendanceStats?.current_streak || 0} <span className="text-[10px] text-orange-600">Days</span></p>
          </div>
        </GlassCard>
      </div>

      {attendanceLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : fetchedAttendance.length > 0 ? (
        view === "calendar" ? (
          <AttendanceCalendar data={formatAttendanceForUI(fetchedAttendance)} onViewMore={setViewMoreAttendance} />
        ) : (
          <GlassCard>
            <Table
              headers={["Date", "Check In", "Check Out", "Action"]}
              rows={formatAttendanceForUI(fetchedAttendance).map((a) => [
                a.date,
                a.checkIn,
                a.checkOut,
                a.records.length > 1 ? (
                  <button
                    onClick={() => setViewMoreAttendance(a.records)}
                    className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] rounded hover:bg-indigo-200"
                    key={a.date}
                  >
                    +{a.records.length - 1} More
                  </button>
                ) : null
              ])}
            />
          </GlassCard>
        )
      ) : (
        <EmptyState title="Registry Empty" hint="No attendance markers found for the current temporal selection." />
      )}

      <Modal open={!!viewMoreAttendance} onClose={() => setViewMoreAttendance(null)} title="Check-in Details">
        <div className="p-4">
          <Table
            headers={["Check In", "Check Out", "Status", "Duration"]}
            rows={(viewMoreAttendance || []).map((r) => [
              new Date(r.check_in * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              r.check_out ? new Date(r.check_out * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---",
              <StatusBadge key={r.id} status={r.status === "present" ? "Present" : (r.status as any)} />,
              r.duration || "—"
            ])}
          />
        </div>
      </Modal>
    </div>
  );
}
