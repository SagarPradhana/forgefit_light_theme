import { useState } from "react";
import { motion } from "framer-motion";
import { CommonButton, Modal, ButtonLoader } from "../../ui/primitives";
import { User, Calendar, Clock, LogOut } from "lucide-react";
import { SuccessAnimation } from "../../ui/ActionAnimations";

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
  onSave: () => Promise<void> | void;
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all";
const sel = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all appearance-none cursor-pointer";

export function ManualAttendanceModal({
  isOpen,
  onClose,
  editingRecord,
  form,
  setForm,
  members,
  onSave
}: ManualAttendanceModalProps) {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch {
      setSaving(false);
    }
  };

  const modalContent = saveSuccess ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <SuccessAnimation show={true} size={72} />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-lg font-semibold text-gray-900"
      >
        Attendance Saved!
      </motion.p>
      <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
    </motion.div>
  ) : (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</span>
        </div>
        <select className={sel} value={form.user_id}
          onChange={e => { const u = members.find((m: any) => m.id === e.target.value); setForm({ ...form, user_id: e.target.value, userName: u?.name || "" }); }}>
          <option value="">Select member</option>
          {members.map((m: any) => (<option key={m.id} value={m.id}>{m.name}</option>))}
        </select>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
        </div>
        <input type="date" max={new Date().toISOString().split('T')[0]} className={inp}
          value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-green-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</span>
          </div>
          <div className="space-y-3">
            <input type="time" className={inp} value={form.checkIn}
              onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            <select className={sel} value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <LogOut size={16} className="text-purple-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</span>
          </div>
          <div className="space-y-3">
            <input type="time" className={inp} value={form.checkOut}
              onChange={e => setForm({ ...form, checkOut: e.target.value })} />
            <p className="text-xs text-gray-400 italic">Optional</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? "Edit Attendance Record" : "Manual Check-In"}
      footer={
        <div className="flex gap-3">
          <CommonButton variant="ghost" onClick={onClose} disabled={saving}>Cancel</CommonButton>
          <CommonButton onClick={handleSave} disabled={saving}>
            <ButtonLoader label={editingRecord ? "Update Record" : "Save Attendance"} loadingLabel="Saving..." loading={saving} />
          </CommonButton>
        </div>
      }
    >
      {modalContent}
    </Modal>
  );
}

