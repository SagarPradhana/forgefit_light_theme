import { Modal, Table as PrimitiveTable, CommonButton, Skeleton } from "../../ui/primitives";
import { useState, useEffect, useCallback } from "react";
import { adminAttendanceService, type AttendanceResponse } from "../../../services/adminAttendanceService";
import { useTranslation } from "react-i18next";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
}

export const AttendanceModal = ({ isOpen, onClose, selectedUser }: AttendanceModalProps) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0]
  });

  const fetchHistory = useCallback(async () => {
    if (!selectedUser?.id) return;
    setLoading(true);
    try {
      const from_date = Math.floor(new Date(filters.from_date).setHours(0, 0, 0, 0) / 1000);
      const to_date = Math.floor(new Date(filters.to_date).setHours(23, 59, 59, 999) / 1000);

      const res = await adminAttendanceService.getUserAttendance(selectedUser.id, { from_date, to_date });
      if (res && res.data) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedUser?.id, filters.from_date, filters.to_date]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  const stats = {
    total: records.length,
    present: records.filter(r => r.status.toLowerCase() === 'present').length,
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`${t("attendanceHistory")} - ${selectedUser?.name}`}
      footer={
        <CommonButton onClick={onClose}>
          {t("close")}
        </CommonButton>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">{t("fromDate")}</label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
              value={filters.from_date}
              onChange={e => setFilters({ ...filters, from_date: e.target.value })}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">{t("toDate")}</label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
              value={filters.to_date}
              onChange={e => setFilters({ ...filters, to_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase font-bold mb-1">{t("totalLogs")}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase font-bold mb-1">{t("presentCount")}</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : (
          <PrimitiveTable
            headers={[t("date"), t("checkIn"), t("checkOut"), t("status")]}
            rows={records.map(r => [
              new Date(r.date * 1000).toLocaleDateString(),
              new Date(r.check_in * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              r.check_out ? new Date(r.check_out * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t("active"),
              <span key={r.id} className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status.toLowerCase() === 'present' ? 'text-emerald-600 bg-emerald-500/10' : 'text-red-600 bg-red-500/10'}`}>
                {r.status}
              </span>
            ])}
          />
        )}

        {records.length === 0 && !loading && (
          <div className="text-center py-10 border border-dashed border-[var(--border-subtle)] rounded-2xl">
            <p className="text-sm text-[var(--text-muted)]">{t("noHistoryFound")}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
