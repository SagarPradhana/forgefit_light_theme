import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GlassCard, SectionTitle, Table, CommonButton } from "../ui/primitives";
import { Grid, List, Search, Clock, Edit2, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminAttendanceService, type AttendanceResponse, type AttendanceRequest } from "../../services/adminAttendanceService";
import { useEffect, useCallback, useMemo } from "react";
import { Skeleton } from "../ui/primitives";
import { toast } from "../../store/toastStore";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../utils/url";
import { DateRangeFilter, type DateRange } from "../ui/DateRangeFilter";
import { DeleteConfirmationModal } from "../common/DeleteConfirmationModal";
import { ManualAttendanceModal } from "./attendance/ManualAttendanceModal";
import { t } from "i18next";

type AttendanceView = "grid" | "list";


export function AttendanceManagement() {
  const { t } = useTranslation();
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

  const { data: statsData, refetch: fetchStats } = useGet(
    dateRange ? `${API_ENDPOINTS.ADMIN.ATTENDANCE_STATS}?from_date=${dateRange.from_date}&to_date=${dateRange.to_date}` : null,
    { useCache: false }
  );

  const stats = statsData || { total_checkins_today: 0, present_now: 0, checked_out_today: 0, avg_time_hours: 0 };
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceResponse | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    userName: "",
    date: new Date().toISOString().split('T')[0],
    checkIn: "09:00",
    checkOut: "",
    status: "present"
  });

  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: usersDropdownData } = useGet(API_ENDPOINTS.ADMIN.GET_USERS_DROPDOWN, { useCache: true });
  const members = useMemo(() => usersDropdownData?.data || [], [usersDropdownData]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAttendanceService.getAttendance({
        search: searchQuery || undefined,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
        count: 100
      });
      if (res && res.data) setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, dateRange]);

  useEffect(() => {
    fetchRecords();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchRecords();
  }, [searchQuery, dateRange]);

  const handleSave = async () => {
    if (!form.user_id) {
      toast.error("Please select a member");
      return;
    }
    if (!form.date) {
      toast.error("Please select a date");
      return;
    }
    if (!form.checkIn) {
      toast.error("Please select a check-in time");
      return;
    }

    try {
      // Use epoch conversion
      const dateTimestamp = Math.floor(new Date(form.date).getTime() / 1000);

      const checkInTime = new Date(form.date + 'T' + form.checkIn);
      const checkOutTime = form.checkOut ? new Date(form.date + 'T' + form.checkOut) : undefined;

      const payload: AttendanceRequest = {
        user_id: form.user_id,
        status: form.status.toLowerCase(),
        date: dateTimestamp,
        check_in: Math.floor(checkInTime.getTime() / 1000),
        check_out: checkOutTime ? Math.floor(checkOutTime.getTime() / 1000) : undefined,
        description: ""
      };

      if (editingRecord) {
        await adminAttendanceService.updateAttendance(editingRecord.id, editingRecord.user_id, payload);
        toast.success("Attendance record updated");
      } else {
        await adminAttendanceService.createAttendance(payload);
        toast.success("New attendance logged");
      }
      setModalOpen(false);
      setEditingRecord(null);
      fetchRecords();
      fetchStats();
    } catch (err) {
      toast.error("Failed to save record");
    }
  };

  const handleEdit = (r: AttendanceResponse) => {
    setEditingRecord(r);
    setForm({
      user_id: r.user_id,
      userName: r.user_name || "",
      date: new Date(r.date * 1000).toISOString().split('T')[0],
      checkIn: new Date(r.check_in * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
      checkOut: r.check_out ? new Date(r.check_out * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }) : "",
      status: r.status.toLowerCase()
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      setDeleteLoading(true);
      try {
        await adminAttendanceService.deleteAttendance(deleteId);
        toast.success("Record purged from registry");
        fetchRecords();
        fetchStats();
        setTimeout(() => { setDeleteModalOpen(false); setDeleteId(null); setDeleteLoading(false); }, 800);
      } catch (err) {
        toast.error("Process failure");
        setDeleteLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filter at Top */}
      <div className="flex justify-end">
        <DateRangeFilter
          defaultPreset="today"
          onChange={(range) => setDateRange(range)}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("totalCheckIns"), value: stats.total_checkins_today || 0, color: "bg-emerald-500" },
          { label: t("presentNow"), value: stats.present_now || 0, color: "bg-indigo-500" },
          { label: t("checkedOut"), value: stats.checked_out_today || 0, color: "bg-amber-500" },
          {
            label: t("avgHours"), value: (() => {
              const hours = Number(stats.avg_time_hours) || 0;
              const h = Math.floor(hours);
              const m = Math.round((hours - h) * 60);
              return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
            })(), color: "bg-purple-500"
          },
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className={`absolute -top-8 -right-8 w-16 h-16 rounded-full blur-2xl opacity-20 ${stat.color}`} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Header row: title + view toggle */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <SectionTitle
          title={t("attendance")}
          subtitle={t("attendanceSubtitle")}
        />

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* View toggle */}
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
        {/* Controls — search + Mark Attendance only (date moved to top) */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition"
              placeholder={t("searchMembersPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CommonButton
            onClick={() => {
              setEditingRecord(null);
              setForm({ user_id: "", userName: "", date: new Date().toISOString().split('T')[0], checkIn: "09:00", checkOut: "", status: "present" });
              setModalOpen(true);
            }}
            className="whitespace-nowrap flex gap-2 items-center justify-center p-3 sm:p-auto"
          >
            <Plus size={18} /> {t("markAttendance")}
          </CommonButton>
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
              {records.map(record => (
                <AttendanceGridCard
                  key={record.id}
                  record={record}
                  onEdit={() => handleEdit(record)}
                  onDelete={() => { setDeleteId(record.id); setDeleteModalOpen(true); }}
                />
              ))}
              {records.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-slate-500">No attendance records found for this date.</p>
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
                columns={[
                  { key: "name", label: t("nameMobileEmail"), render: (r: any) => (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--accent-orange)]/30 to-[var(--accent-gold)]/30 flex items-center justify-center text-xs font-bold text-[var(--accent-orange)] shrink-0">
                        {r.user_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-[var(--text-primary)]">{r.user_name || "—"}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{(r as any).email || (r as any).mobile || "—"}</p>
                      </div>
                    </div>
                  )},
                  { key: "check_in", label: t("checkIn"), render: (r: any) => new Date(r.check_in * 1000).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) },
                  { key: "check_out", label: t("checkOut"), render: (r: any) => r.check_out ? new Date(r.check_out * 1000).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) : <span className="text-emerald-600 font-semibold">{t("active")}</span> },
                  { key: "status", label: t("status"), render: (r: any) => (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      r.status?.toLowerCase() === "present" ? "bg-emerald-100 text-emerald-600" :
                      r.status?.toLowerCase() === "late" ? "bg-amber-100 text-amber-600" :
                      "bg-red-100 text-red-600"
                    }`}>{r.status || 'N/A'}</span>
                  )},
                  { key: "actions", label: t("actions"), render: (r: any) => (
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => handleEdit(r)} className="text-[var(--accent-orange)] hover:text-[var(--accent-gold)] transition-transform hover:scale-125"><Edit2 size={16} /></button>
                      <button onClick={() => { setDeleteId(r.id); setDeleteModalOpen(true); }} className="text-red-500 hover:text-red-600 transition-transform hover:scale-125"><Trash2 size={16} /></button>
                    </div>
                  )},
                ]}
                data={records}
                pagination={false}
                sortable={false}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </GlassCard>

      <ManualAttendanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingRecord={editingRecord}
        form={form}
        setForm={setForm}
        members={members}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteRecordQuestion")}
        description={t("deleteRecordDescription")}
        confirmLabel={t("submit")}
        isProcessing={deleteLoading}
      />
    </div>
  );
}

function AttendanceGridCard({ record, onEdit, onDelete }: { record: AttendanceResponse, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-all hover:bg-white/[0.08] relative overflow-hidden">
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-[0_8px_16px_rgba(99,102,241,0.3)]">
          {(record.user_name || 'U').charAt(0)}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight text-xs">{record.user_name || `ID: ${record.id.substring(0, 8)}`}</h4>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${record.status?.toLowerCase() === "present" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}>
            {record.status || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onEdit} className="p-2 bg-white/5 rounded-lg text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"><Edit2 size={14} /></button>
          <button onClick={onDelete} className="p-2 bg-white/5 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-black/20 rounded-xl relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-black">{t("checkIn")}</span>
          <p className="text-white font-bold text-sm flex items-center gap-2"><Clock size={12} /> {new Date(record.check_in * 1000).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="space-y-1 border-l border-white/10 pl-3">
          <span className="text-[10px] text-slate-500 uppercase font-black">{t("checkOut")}</span>
          <p className="text-white font-bold text-sm flex items-center gap-2"><Clock size={12} /> {record.check_out ? new Date(record.check_out * 1000).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) : t("active")}</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl -z-0 rounded-full group-hover:bg-indigo-500/20 transition-all" />
    </div>
  );
}


