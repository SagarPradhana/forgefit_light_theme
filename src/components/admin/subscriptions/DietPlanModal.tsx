import { Modal, GlowButton, ButtonLoader } from "../../ui/primitives";
import { Plus, Trash2 } from "lucide-react";
import type { DietPlan } from "../../../services/adminPlansService";
import { useTranslation } from "react-i18next";

interface DietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDietId: string | null;
  dietForm: DietPlan;
  setDietForm: (form: DietPlan) => void;
  onSave: () => void;
  saving?: boolean;
}

export function DietPlanModal({
  isOpen,
  onClose,
  editDietId,
  dietForm,
  setDietForm,
  onSave,
  saving = false,
}: DietPlanModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editDietId ? t("editNutritionalPlan") : t("createNutritionalPlan")}
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] transition-all"
            onClick={onClose}
            disabled={saving}
          >
            {t("cancel")}
          </button>
          <GlowButton onClick={onSave} disabled={saving} className="px-8 from-emerald-600 to-teal-500 shadow-emerald-500/20 hover:shadow-emerald-500/40">
            <ButtonLoader label={t("submit")} loadingLabel={t("loading")} loading={saving} />
          </GlowButton>
        </div>
      }
    >
      <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t("protocolDesignation")}</label>
            <input
              className="w-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 text-[var(--text-primary)] focus:border-emerald-500/50 outline-none transition duration-300 text-sm font-bold"
              value={dietForm.name}
              onChange={(e) => setDietForm({ ...dietForm, name: e.target.value })}
              placeholder={t("protocolDesignationPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t("strategicFocus")}</label>
            <input
              className="w-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 text-[var(--text-primary)] focus:border-emerald-500/50 outline-none transition duration-300 text-sm font-bold"
              value={dietForm.focus}
              onChange={(e) => setDietForm({ ...dietForm, focus: e.target.value })}
              placeholder={t("strategicFocusPlaceholder")}
            />
          </div>
        </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">{t("nutritionalCycles")}</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight">{t("defineMacros")}</p>
              </div>
              <button
                onClick={() => setDietForm({
                  ...dietForm,
                  diet_details: [...dietForm.diet_details, { day: String(dietForm.diet_details.length + 1), foods: [] }]
                })}
                className="group flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">{t("addCycle")} +</span>
              </button>
            </div>

            <div className="space-y-4">
              {dietForm.diet_details.map((dayDetail, dIndex) => (
                <div key={dIndex} className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-subtle)] space-y-6 relative group transition-all hover:border-[var(--accent-orange)]/20 hover:bg-[var(--bg-card-hover)]">
                  <button
                    onClick={() => {
                      const newDetails = [...dietForm.diet_details];
                      newDetails.splice(dIndex, 1);
                      setDietForm({ ...dietForm, diet_details: newDetails });
                    }}
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-red-500 transition-colors bg-[var(--bg-card-hover)] hover:bg-red-500/10 p-1.5 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <div className="w-full md:w-1/2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("dayIdentifier")}</label>
                    <select
                      className="w-full bg-transparent border-b border-[var(--border-subtle)] py-2 text-[var(--text-primary)] focus:border-emerald-500 outline-none text-base font-black mt-1 transition-colors"
                      value={dayDetail.day || ""}
                      onChange={(e) => {
                        const newDetails = [...dietForm.diet_details];
                        newDetails[dIndex].day = e.target.value;
                        setDietForm({ ...dietForm, diet_details: newDetails });
                      }}
                    >
                        <option value="" className="bg-white text-[var(--text-muted)]">{t("selectDay")}</option>
                        <option value="1" className="bg-white text-[var(--text-primary)]">{t("monday")}</option>
                        <option value="2" className="bg-white text-[var(--text-primary)]">{t("tuesday")}</option>
                        <option value="3" className="bg-white text-[var(--text-primary)]">{t("wednesday")}</option>
                        <option value="4" className="bg-white text-[var(--text-primary)]">{t("thursday")}</option>
                        <option value="5" className="bg-white text-[var(--text-primary)]">{t("friday")}</option>
                        <option value="6" className="bg-white text-[var(--text-primary)]">{t("saturday")}</option>
                        <option value="7" className="bg-white text-[var(--text-primary)]">{t("sunday")}</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("macroComposition")}</label>
                      <button
                        onClick={() => {
                          const newDetails = [...dietForm.diet_details];
                          newDetails[dIndex].foods.push({ name: "", weight: "" });
                          setDietForm({ ...dietForm, diet_details: newDetails });
                        }}
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-2 py-1 rounded-md"
                      >
                        <span className="text-[10px] font-black uppercase">{t("addFood")}</span>
                      </button>
                    </div>
                    
                    <div className="grid gap-2">
                      {dayDetail.foods.map((food, fIndex) => (
                        <div key={fIndex} className="flex gap-2 items-center bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-subtle)] group/row hover:border-emerald-500/20 transition-all">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">{t("ingredientMeal")}</span>
                              <input
                                className="bg-white border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-xs text-[var(--text-primary)] w-full outline-none focus:border-emerald-500/30"
                                placeholder={t("foodPlaceholder")}
                                value={food.name}
                                onChange={(e) => {
                                  const newDetails = [...dietForm.diet_details];
                                  newDetails[dIndex].foods[fIndex].name = e.target.value;
                                  setDietForm({ ...dietForm, diet_details: newDetails });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider ml-1">{t("portionSize")}</span>
                              <input
                                className="bg-white border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-xs text-[var(--text-primary)] w-full outline-none focus:border-emerald-500/30"
                                placeholder={t("portionPlaceholder")}
                                value={food.weight}
                                onChange={(e) => {
                                  const newDetails = [...dietForm.diet_details];
                                  newDetails[dIndex].foods[fIndex].weight = e.target.value;
                                  setDietForm({ ...dietForm, diet_details: newDetails });
                                }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newDetails = [...dietForm.diet_details];
                              newDetails[dIndex].foods.splice(fIndex, 1);
                              setDietForm({ ...dietForm, diet_details: newDetails });
                            }}
                            className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10 mt-4"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {dayDetail.foods.length === 0 && (
                        <div className="text-center py-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] border-dashed">
                          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{t("noMealsDefined")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </Modal>
  );
}
