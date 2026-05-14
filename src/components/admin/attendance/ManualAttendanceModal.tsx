import { CommonButton, Modal } from "../../ui/primitives";
import { useTranslation } from "react-i18next";

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord: any;
  form: {
    user_id: string;
    userName: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: string;
  };
  setForm: (form: any) => void;
  members: any[];
  onSave: () => void;
}

export function ManualAttendanceModal({
  isOpen,
  onClose,
  editingRecord,
  form,
  setForm,
  members,
  onSave
}: ManualAttendanceModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? t("editAttendanceLog") : t("manualCheckIn")}
      footer={
        <div className="flex gap-3">
          <CommonButton variant="ghost" onClick={onClose}>{t("cancel")}</CommonButton>
          <CommonButton onClick={onSave}>{t("submit")}</CommonButton>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500">{t("memberName")}</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
            value={form.user_id}
            onChange={e => {
              const user = members.find((u: any) => u.id === e.target.value);
              setForm({ ...form, user_id: e.target.value, userName: user?.name || "" });
            }}
          >
            <option value="" className="bg-slate-900">{t("selectMember")}</option>
            {members.map((m: any) => (
              <option key={m.id} value={m.id} className="bg-slate-900">{m.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">{t("date")}</label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">{t("status")}</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="present" className="bg-slate-900">{t("present")}</option>
              <option value="absent" className="bg-slate-900">{t("absent")}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">{t("checkIn")}</label>
            <input
              type="time"
              max={form.date === new Date().toISOString().split('T')[0] ? new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }) : undefined}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              value={form.checkIn}
              onChange={e => setForm({ ...form, checkIn: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">{t("checkOut")}</label>
            <input
              type="time"
              max={form.date === new Date().toISOString().split('T')[0] ? new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }) : undefined}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              value={form.checkOut}
              onChange={e => setForm({ ...form, checkOut: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
