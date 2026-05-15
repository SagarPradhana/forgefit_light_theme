import { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GlassCard, SectionTitle, Table, Skeleton } from "../ui/primitives";
import { Grid, List, Search, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { API_ENDPOINTS } from "../../utils/url";
import { DateRangeFilter, type DateRange } from "../ui/DateRangeFilter";
import { api } from "../../utils/httputils";

type AttendanceView = "grid" | "list";

interface TrainerAttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  date: number;
  status: string;
  check_in: number;
  check_out: number | null;
  duration: string;
  description: string;
  is_deleted: boolean;
  created_date: number;
  updated_date: number;
}

export function TrainerAttendance() {
  const { t } = useTranslation();
  const { id: userId } = useAuthStore();
  
  const toUnix = (d: string, end = false) => {
    const dt = new Date(d);
    end ? dt.setHours(23, 59, 59, 999) : dt.setHours(0, 0, 0, 0);
    return Math.floor(dt.getTime() / 1000);
  };

  const [viewType, setViewType] = useState<AttendanceView>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    label: "Today",
    from_date: toUnix(today, false),
    to_date: toUnix(today, true)
  });

  const [records, setRecords] = useState<TrainerAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchRecords = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_date: String(dateRange.from_date || 0),
        to_date: String(dateRange.to_date || 0),
        count: "100",
        offset: "0"
      });
      
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const res = await api.get(`${API_ENDPOINTS.ADMIN.TRAINER_ATTENDANCE(userId)}?${params.toString()}`);
      if (res && res.data) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, searchQuery, dateRange, statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [searchQuery, dateRange, statusFilter]);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.user_name?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <SectionTitle
          title={t("attendance")}
          subtitle="Track your assigned members attendance history"
        />

        <div className="flex items-center gap-3 self-end md:self-auto">
          <DateRangeFilter
            defaultPreset="today"
            onChange={(range) => setDateRange(range)}
          />

          <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
            {(["grid", "list"] as AttendanceView[]).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`p-2 rounded-lg transition-all ${viewType === type ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
              >
                {type === "grid" && <Grid size={18} />}
                {type === "list" && <List size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition"
              placeholder="Search member by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-500 transition cursor-pointer appearance-none min-w-[150px]"
>
  <option value="" className="bg-white">All Status</option>
  <option value="present" className="bg-white">Present</option>
  <option value="absent" className="bg-white">Absent</option>
  <option value="late" className="bg-white">Late</option>
</select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
            </div>
          ) : viewType === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredRecords.map(record => (
                <TrainerAttendanceGridCard key={record.id} record={record} />
              ))}
              {filteredRecords.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-slate-500">No attendance records found for this date range.</p>
                </div>
              )}
            </motion.div>
          )}

          {viewType === "list" && !loading && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Table
                headers={["Member", "Date", "Check In", "Check Out", "Status", "Duration"]}
                rows={filteredRecords.map(r => [
                  <span key={r.id} className="text-sm font-medium text-white">{r.user_name || '-'}</span>,
                  new Date(r.date * 1000).toLocaleDateString(),
                  new Date(r.check_in * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  r.check_out ? new Date(r.check_out * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-blue-400">Active</span>,
                  <span key={`${r.id}-status`} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status?.toLowerCase() === "present" ? "bg-emerald-500/20 text-emerald-400" :
                    r.status?.toLowerCase() === "late" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                    {r.status || 'N/A'}
                  </span>,
                  <span key={`${r.id}-dur`} className="text-slate-400 text-sm">{r.duration || '-'}</span>
                ])}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}

function TrainerAttendanceGridCard({ record }: { record: TrainerAttendanceRecord }) {
  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-all hover:bg-white/[0.08] relative overflow-hidden">
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-[0_8px_16px_rgba(99,102,241,0.3)]">
          {(record.user_name || 'U').charAt(0)}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight text-xs truncate">{record.user_name || `ID: ${record.id.substring(0, 8)}`}</h4>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${record.status?.toLowerCase() === "present" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}>
            {record.status || 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 bg-black/20 rounded-xl relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-black">In</span>
          <p className="text-white font-bold text-sm flex items-center gap-2"><Clock size={12} /> {new Date(record.check_in * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="space-y-1 border-l border-white/10 pl-3">
          <span className="text-[10px] text-slate-500 uppercase font-black">Out</span>
          <p className="text-white font-bold text-sm flex items-center gap-2"><Clock size={12} /> {record.check_out ? new Date(record.check_out * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}</p>
        </div>
        <div className="space-y-1 border-l border-white/10 pl-3">
          <span className="text-[10px] text-slate-500 uppercase font-black">Duration</span>
          <p className="text-white font-bold text-sm">{record.duration || '-'}</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl -z-0 rounded-full group-hover:bg-indigo-500/20 transition-all" />
    </div>
  );
}