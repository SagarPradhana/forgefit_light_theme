import { CommonButton, Modal } from "../../ui/primitives";
import { useTranslation } from "react-i18next";
import { User, Calendar, Clock, CheckCircle2 } from "lucide-react";

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

const inp = "w-full bg-white border border-amber-200/70 rounded-xl px-4 py-2.5 text-gray-800 outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)] transition shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]";
const sel = "w-full bg-white border border-amber-200/70 rounded-xl px-4 py-2.5 text-gray-800 outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)] transition appearance-none cursor-pointer shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]";
const lbl = "text-xs font-bold uppercase text-gray-500 tracking-wider";

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
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-4 space-y-4">
          <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
            <User size={13} className="text-[var(--accent-orange)]" /> {t("memberName")}
          </h4>
          <div className="relative">
            <select className={sel} value={form.user_id}
              onChange={e => { const u = members.find((m: any) => m.id === e.target.value); setForm({ ...form, user_id: e.target.value, userName: u?.name || "" }); }}>
              <option value="" className="bg-white">{t("selectMember")}</option>
              {members.map((m: any) => (<option key={m.id} value={m.id} className="bg-white">{m.name}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-4 space-y-4">
          <h4 className="text-[11px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={13} className="text-blue-500" /> {t("date")}
          </h4>
          <input type="date" max={new Date().toISOString().split('T')[0]} className={inp}
            value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
              <Clock size={13} className="text-emerald-500" /> {t("checkIn")}
            </h4>
            <input type="time" className={inp} value={form.checkIn}
              onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            <select className={sel} value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="present" className="bg-white">{t("present")}</option>
              <option value="absent" className="bg-white">{t("absent")}</option>
            </select>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-purple-700 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={13} className="text-purple-500" /> {t("checkOut")}
            </h4>
            <input type="time" className={inp} value={form.checkOut}
              onChange={e => setForm({ ...form, checkOut: e.target.value })} />
            <div className="text-[10px] text-gray-400 italic">{t("optional")}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
