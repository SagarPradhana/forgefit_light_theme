import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Loader2, Eye, EyeOff, X, User, MapPin, UserCog, Heart, CheckCircle2 } from "lucide-react";
import type { UserFormData, ModalStep, UserRole } from "./types";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../../utils/formUtils";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  modalStep: ModalStep;
  setModalStep: (step: ModalStep) => void;
  editingUserId: string | null;
  onSave: () => void;
  onNext: () => void;
  onBack: () => void;
  roles: string[];
  plans: any[];
  trainers: any[];
  isAnyLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  getModalTitle: () => string;
  getStepNumber: () => string;
  isFinalStep: boolean;
  portalType?: "admin" | "trainer";
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all";
const sel = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all appearance-none cursor-pointer";

export const UserModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  modalStep,
  editingUserId,
  onSave,
  onNext,
  onBack,
  roles,
  trainers,
  isAnyLoading,
  showPassword,
  setShowPassword,
  getModalTitle,
  getStepNumber: _getStepNumber,
  isFinalStep,
  portalType = "admin",
}: UserModalProps) => {
  if (!isOpen) return null;

  const steps = ["role", "details", "metadata", "membership"];
  const currentIdx = steps.indexOf(modalStep);
  const stepLabels = ["Personal Info", "Assignment", "Profile", "Membership"];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 md:pt-16 pb-10 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100 shadow-xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                {modalStep === "role" && <User size={18} className="text-orange-500" />}
                {modalStep === "details" && <MapPin size={18} className="text-orange-500" />}
                {modalStep === "metadata" && <Heart size={18} className="text-orange-500" />}
                {modalStep === "membership" && <UserCog size={18} className="text-orange-500" />}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{getModalTitle()}</h2>
                <p className="text-xs text-gray-500">Step {currentIdx + 1} of {steps.length}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <X size={18} />
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${i <= currentIdx ? "bg-orange-500" : "bg-gray-200"}`} />
                {i < steps.length - 1 && <div className="w-1" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {stepLabels.map((label, i) => (
              <span key={label} className={`text-[10px] font-medium ${i <= currentIdx ? "text-orange-600" : "text-gray-400"}`}>{label}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {modalStep === "role" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input className={inp} placeholder="Enter full name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile <span className="text-red-500">*</span></label>
                  <input type="tel" className={inp} placeholder="Mobile number" value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: sanitizePhone(e.target.value) })}
                    onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className={inp} placeholder="Email (optional)" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              {!editingUserId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className={`${inp} pr-10`} placeholder="Create a password" value={formData.password || ""}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {modalStep === "details" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select className={sel} value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}>
                  {roles.map((role) => (<option key={role} value={role} className="capitalize">{role}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                <textarea className={`${inp} resize-none`} rows={3} placeholder="Enter full address" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date <span className="text-red-500">*</span></label>
                <input type="date" max={new Date().toISOString().split('T')[0]} className={inp}
                  value={formData.joining_date ? new Date(formData.joining_date * 1000).toISOString().split('T')[0] : ""}
                  onChange={(e) => { const d = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0; setFormData({ ...formData, joining_date: d }); }} />
              </div>
            </motion.div>
          )}

          {modalStep === "metadata" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {formData.role === "trainer" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input className={inp} type="text" placeholder="e.g. Strength Training, Yoga" value={formData.metadata.specialization || ""}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, specialization: e.target.value } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                      <input className={inp} type="number" placeholder="Years" value={formData.metadata.experience || ""}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, experience: Number(e.target.value) } })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                    <input className={inp} type="text" placeholder="Any certifications" value={formData.metadata.certifications || ""}
                      onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, certifications: e.target.value } })} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                      <input className={inp} type="number" value={formData.metadata.height}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, height: Number(e.target.value) } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                      <input className={inp} type="number" value={formData.metadata.weight}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, weight: Number(e.target.value) } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input className={inp} type="date" max={new Date().toISOString().split('T')[0]}
                        value={formData.metadata.dob ? new Date(formData.metadata.dob * 1000).toISOString().split('T')[0] : ""}
                        onChange={(e) => { const d = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0; setFormData({ ...formData, metadata: { ...formData.metadata, dob: d } }); }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select className={sel} value={formData.metadata.gender}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, gender: e.target.value } })}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                      <input className={inp} type="tel" value={formData.metadata.emergency_contact}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, emergency_contact: sanitizePhone(e.target.value) } })}
                        onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
                      <select className={sel} value={formData.metadata.fitness_goal}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, fitness_goal: e.target.value } })}>
                        <option value="fat_loss">Fat Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="fitness">General Fitness</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Workout Time</label>
                      <select className={sel} value={formData.metadata.workout_time}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, workout_time: e.target.value } })}>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                    <textarea className={`${inp} resize-none`} rows={2} placeholder="Any medical conditions or injuries"
                      value={formData.metadata.medical_conditions || ""}
                      onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, medical_conditions: e.target.value } })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select className={sel} value={formData.metadata.language}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, language: e.target.value } })}>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                        <option value="or">Odia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Theme Preference</label>
                      <select className={sel} value={formData.metadata.theme}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, theme: e.target.value } })}>
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {modalStep === "membership" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {(portalType === "admin" || portalType === "trainer") && formData.role !== "user" ? (
                <div className="text-center py-8">
                  <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} className="text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.role === "admin" ? "Admin role — no trainer assignment needed" : "Trainer role — no trainer assignment needed"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Proceed to submit to finalize</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Trainer (Optional)</label>
                  <select className={sel} value={formData.trainer_id || ""}
                    onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}>
                    <option value="">No trainer</option>
                    {trainers.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {modalStep !== "role" && (
              <button onClick={onBack}
                className="px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1">
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            <button disabled={isAnyLoading} onClick={isFinalStep ? onSave : onNext}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isAnyLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isFinalStep ? "Submit" : "Next"}
                  {!isFinalStep && <ChevronRight size={16} />}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};