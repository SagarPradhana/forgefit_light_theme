import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Loader2, Eye, EyeOff, X, User, Phone, Mail, Lock, MapPin, Calendar, Briefcase, UserCog, Heart, Dumbbell, Scale, Languages, Palette, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import type { UserFormData, ModalStep, UserRole } from "./types";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../../utils/formUtils";
import { useTranslation } from "react-i18next";

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

const inp = "w-full bg-white/95 border border-amber-200/70 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)] transition shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]";
const lbl = "block text-sm font-semibold text-gray-700 mb-2";
const sel = "w-full bg-white/95 border border-amber-200/70 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)] transition shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] appearance-none cursor-pointer";

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
      done ? "bg-white" : active ? "bg-white scale-125" : "bg-white/30"
    }`} />
  );
}

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
  getStepNumber,
  isFinalStep,
  portalType = "admin",
}: UserModalProps) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const steps = ["role", "details", "metadata", "membership"];
  const currentIdx = steps.indexOf(modalStep);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 md:pt-16 pb-10 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="relative z-[9999] w-full max-w-2xl mx-4 bg-white rounded-2xl flex flex-col max-h-fit mb-10 overflow-hidden"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.15), 0 10px 40px rgba(232,82,26,0.08)" }}
      >
        {/* Hero header */}
        <div className="bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-gold)] to-[var(--accent-orange)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
                  {modalStep === "role" && <User size={20} />}
                  {modalStep === "details" && <MapPin size={20} />}
                  {modalStep === "metadata" && <Heart size={20} />}
                  {modalStep === "membership" && <UserCog size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white drop-shadow-sm">{getModalTitle()}</h2>
                  <p className="text-[11px] text-white/70 font-medium uppercase tracking-wider">{t("registrationWizard")}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 flex items-center justify-center hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white border border-white/20"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {/* Step progress bar */}
          <div className="flex items-center gap-2 px-6 pb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                  i === currentIdx ? "bg-white/25" : i < currentIdx ? "bg-white/15" : "bg-white/10"
                }`}>
                  <StepDot active={i === currentIdx} done={i < currentIdx} />
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    i <= currentIdx ? "text-white" : "text-white/40"
                  }`}>{t(s) || s}</span>
                </div>
                {i < steps.length - 1 && <div className="w-4 h-px bg-white/20" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-amber-50/30 to-white">
          {/* Step: Personal Info */}
          {modalStep === "role" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200/60 p-5 space-y-5">
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-[var(--accent-orange)]" /> Personal Information
                </h3>
                <div className="sm:col-span-2">
                  <label className={lbl}>Full Name <span className="text-red-500">*</span></label>
                  <input placeholder="Enter full name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inp} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}><Phone size={13} className="inline mr-1 text-[var(--accent-orange)]" />Mobile <span className="text-red-500">*</span></label>
                    <input type="tel" placeholder="Mobile number" value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: sanitizePhone(e.target.value) })}
                      onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}><Mail size={13} className="inline mr-1 text-[var(--accent-orange)]" />Email</label>
                    <input type="email" placeholder="Email address (optional)" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inp} />
                  </div>
                </div>
                {!editingUserId && (
                  <div>
                    <label className={lbl}><Lock size={13} className="inline mr-1 text-[var(--accent-orange)]" />Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Security password" value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`${inp} pr-12`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step: Details */}
          {modalStep === "details" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-5 space-y-5">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} className="text-blue-500" /> Assignment Details
                </h3>
                <div>
                  <label className={lbl}>Role <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className={sel}>
                      {roles.map((role) => (<option key={role} value={role} className="bg-white capitalize">{role}</option>))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Address <span className="text-red-500">*</span></label>
                  <textarea placeholder="Enter full address" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`${inp} resize-none`} rows={4} />
                </div>
                <div>
                  <label className={lbl}>Joining Date <span className="text-red-500">*</span></label>
                  <input type="date" max={new Date().toISOString().split('T')[0]}
                    value={formData.joining_date ? new Date(formData.joining_date * 1000).toISOString().split('T')[0] : ""}
                    onChange={(e) => { const d = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0; setFormData({ ...formData, joining_date: d }); }}
                    className={inp} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Metadata */}
          {modalStep === "metadata" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Admin metadata */}
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-5 space-y-4">
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} className="text-[var(--accent-orange)]" /> Administrative Metadata
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product ID (Internal Ref)</label>
                  <input type="text" placeholder="Enter purchase_id or product identifier"
                    value={formData.metadata.purchase_id || ""}
                    onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, purchase_id: e.target.value } })}
                    className={inp} />
                </div>
              </div>

              {formData.role === "trainer" ? (
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                    <Dumbbell size={14} className="text-emerald-500" /> Trainer Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Specialization <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="e.g., Strength Training, Yoga" value={formData.metadata.specialization || ""}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, specialization: e.target.value } })}
                        className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Experience (Years) <span className="text-red-500">*</span></label>
                      <input type="number" placeholder="Years" value={formData.metadata.experience || ""}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, experience: Number(e.target.value) } })}
                        className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Certifications</label>
                    <input type="text" placeholder="Any certifications or credentials" value={formData.metadata.certifications || ""}
                      onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, certifications: e.target.value } })}
                      className={inp} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-purple-700 uppercase tracking-widest flex items-center gap-2">
                    <Heart size={14} className="text-purple-500" /> Member Profile & Health
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><Scale size={12} className="inline mr-1" />Height</label>
                      <input type="number" value={formData.metadata.height}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, height: Number(e.target.value) } })}
                        className={inp} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Weight</label>
                      <input type="number" value={formData.metadata.weight}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, weight: Number(e.target.value) } })}
                        className={inp} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><Calendar size={12} className="inline mr-1" />DOB</label>
                      <input type="date" max={new Date().toISOString().split('T')[0]}
                        value={formData.metadata.dob ? new Date(formData.metadata.dob * 1000).toISOString().split('T')[0] : ""}
                        onChange={(e) => { const d = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0; setFormData({ ...formData, metadata: { ...formData.metadata, dob: d } }); }}
                        className={inp} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                      <div className="relative">
                        <select value={formData.metadata.gender}
                          onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, gender: e.target.value } })}
                          className={sel}>
                          <option value="male" className="bg-white">Male</option>
                          <option value="female" className="bg-white">Female</option>
                          <option value="other" className="bg-white">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                          <ChevronRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1"><Phone size={12} className="inline mr-1" />Emergency Contact</label>
                      <input type="tel" value={formData.metadata.emergency_contact}
                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, emergency_contact: sanitizePhone(e.target.value) } })}
                        onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} className={inp} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1"><Heart size={12} className="inline mr-1" />{t("fitnessGoal")}</label>
                      <div className="relative">
                        <select value={formData.metadata.fitness_goal}
                          onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, fitness_goal: e.target.value } })}
                          className={sel}>
                          <option value="fat_loss" className="bg-white">{t("fatLoss")}</option>
                          <option value="muscle_gain" className="bg-white">{t("muscleGain")}</option>
                          <option value="fitness" className="bg-white">{t("generalFitness")}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                          <ChevronRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1"><Clock size={12} className="inline mr-1" />{t("workoutTime")}</label>
                      <div className="relative">
                        <select value={formData.metadata.workout_time}
                          onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, workout_time: e.target.value } })}
                          className={sel}>
                          <option value="morning" className="bg-white">{t("morning")}</option>
                          <option value="evening" className="bg-white">{t("evening")}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                          <ChevronRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><AlertCircle size={12} className="inline mr-1" />{t("medicalConditions")}</label>
                    <textarea placeholder={t("medicalConditionsPlaceholder")} value={formData.metadata.medical_conditions || ""}
                      onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, medical_conditions: e.target.value } })}
                      className={`${inp} resize-none`} rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><Languages size={12} className="inline mr-1" />{t("language")}</label>
                      <div className="relative">
                        <select value={formData.metadata.language}
                          onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, language: e.target.value } })}
                          className={sel}>
                          <option value="en" className="bg-white">{t("english")}</option>
                          <option value="hi" className="bg-white">{t("hindi")}</option>
                          <option value="mr" className="bg-white">{t("marathi")}</option>
                          <option value="or" className="bg-white">{t("odia")}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                          <ChevronRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><Palette size={12} className="inline mr-1" />{t("themePreference")}</label>
                      <div className="relative">
                        <select value={formData.metadata.theme}
                          onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, theme: e.target.value } })}
                          className={sel}>
                          <option value="dark" className="bg-white">{t("darkMode")}</option>
                          <option value="light" className="bg-white">{t("lightMode")}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                          <ChevronRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Membership */}
          {modalStep === "membership" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {(portalType === "admin" || portalType === "trainer") && formData.role !== "user" ? (
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 p-8 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <p className="text-gray-600 font-semibold text-sm">
                    {formData.role === "admin" ? "Admin role — no trainer assignment needed" : "Trainer role — no trainer assignment needed"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Proceed to submit to finalize</p>
                </div>
              ) : (
                <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/60 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                    <UserCog size={14} className="text-indigo-500" /> {t("assignTrainer")}
                  </h3>
                  <div className="relative">
                    <select value={formData.trainer_id || ""}
                      onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                      className={sel}>
                      <option value="" className="bg-white">{t("selectTrainerOptional")}</option>
                      {trainers.map((t: any) => (<option key={t.id} value={t.id} className="bg-white">{t.name}</option>))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-amber-100 bg-gradient-to-r from-amber-50/80 to-white flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-amber-200 text-gray-600 hover:text-gray-800 hover:border-amber-300 font-semibold rounded-xl transition shadow-sm"
          >
            {t("cancel")}
          </motion.button>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {modalStep !== "role" && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-amber-200 text-gray-600 hover:text-gray-800 hover:border-amber-300 font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} />
                {t("back")}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={isAnyLoading}
              onClick={isFinalStep ? onSave : onNext}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
              style={{ boxShadow: "0 4px 20px rgba(232,82,26,0.35)" }}
            >
              {isAnyLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isFinalStep ? t("submit") : t("next")}
                  {!isFinalStep && <ChevronRight size={20} />}
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-1 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-gold)] to-[var(--accent-orange)]" />
      </motion.div>
    </div>,
    document.body
  );
};