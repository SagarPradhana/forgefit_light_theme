import { Modal, GlowButton, ButtonLoader } from "../../ui/primitives";
import { Plus, Trash2, Apple, ClipboardList } from "lucide-react";
import type { DietPlan } from "../../../services/adminPlansService";


interface DietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDietId: string | null;
  dietForm: DietPlan;
  setDietForm: (form: DietPlan) => void;
  onSave: () => void;
  saving?: boolean;
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all";

export function DietPlanModal({
  isOpen,
  onClose,
  editDietId,
  dietForm,
  setDietForm,
  onSave,
  saving = false,
}: DietPlanModalProps) {
  //
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editDietId ? "Edit Diet Plan" : "Create Diet Plan"}
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <GlowButton onClick={onSave} disabled={saving} className="px-8">
            <ButtonLoader label="Save Plan" loadingLabel="Saving..." loading={saving} />
          </GlowButton>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        {/* Basic Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={16} className="text-emerald-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Info</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
              <input className={inp} value={dietForm.name}
                onChange={(e) => setDietForm({ ...dietForm, name: e.target.value })}
                placeholder="e.g. Fat Loss Diet" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Focus</label>
              <input className={inp} value={dietForm.focus}
                onChange={(e) => setDietForm({ ...dietForm, focus: e.target.value })}
                placeholder="e.g. Weight Loss, Muscle Gain" />
            </div>
          </div>
        </div>

        {/* Diet Days */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Apple size={16} className="text-emerald-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Meal Days</span>
            </div>
            <button
              onClick={() => setDietForm({
                ...dietForm,
                diet_details: [...dietForm.diet_details, { day: String(dietForm.diet_details.length + 1), foods: [] }]
              })}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <Plus size={14} />
              Add Day
            </button>
          </div>

          <div className="space-y-3">
            {dietForm.diet_details.map((dayDetail, dIndex) => (
              <div key={dIndex} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 relative">
                <button
                  onClick={() => {
                    const newDetails = [...dietForm.diet_details];
                    newDetails.splice(dIndex, 1);
                    setDietForm({ ...dietForm, diet_details: newDetails });
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 outline-none focus:border-emerald-400 transition-all"
                    value={dayDetail.day || ""}
                    onChange={(e) => {
                      const newDetails = [...dietForm.diet_details];
                      newDetails[dIndex].day = e.target.value;
                      setDietForm({ ...dietForm, diet_details: newDetails });
                    }}
                  >
                    <option value="">Select day</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="7">Sunday</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Meals / Food Items</label>
                    <button
                      onClick={() => {
                        const newDetails = [...dietForm.diet_details];
                        newDetails[dIndex].foods.push({ name: "", weight: "" });
                        setDietForm({ ...dietForm, diet_details: newDetails });
                      }}
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                    >
                      <Plus size={12} />
                      Add Food
                    </button>
                  </div>

                  <div className="grid gap-2">
                    {dayDetail.foods.map((food, fIndex) => (
                      <div key={fIndex} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Food / Meal</span>
                            <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-emerald-400 mt-1"
                              placeholder="e.g. Oatmeal" value={food.name}
                              onChange={(e) => {
                                const newDetails = [...dietForm.diet_details];
                                newDetails[dIndex].foods[fIndex].name = e.target.value;
                                setDietForm({ ...dietForm, diet_details: newDetails });
                              }} />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Portion / Weight</span>
                            <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-emerald-400 mt-1"
                              placeholder="e.g. 100g, 1 cup" value={food.weight}
                              onChange={(e) => {
                                const newDetails = [...dietForm.diet_details];
                                newDetails[dIndex].foods[fIndex].weight = e.target.value;
                                setDietForm({ ...dietForm, diet_details: newDetails });
                              }} />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newDetails = [...dietForm.diet_details];
                            newDetails[dIndex].foods.splice(fIndex, 1);
                            setDietForm({ ...dietForm, diet_details: newDetails });
                          }}
                          className="text-gray-400 hover:text-red-500 mt-5 p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {dayDetail.foods.length === 0 && (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-xs text-gray-500 font-medium">No meals added yet</p>
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
