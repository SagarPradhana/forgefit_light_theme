import { Modal, GlowButton, ButtonLoader } from "../../ui/primitives";
import { Plus, Trash2, Dumbbell, Target, ClipboardList } from "lucide-react";
import type { WorkoutPlan } from "../../../services/adminPlansService";


interface WorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editWorkoutId: string | null;
  workoutForm: WorkoutPlan;
  setWorkoutForm: (form: WorkoutPlan) => void;
  onSave: () => void;
  saving?: boolean;
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all";

export function WorkoutPlanModal({
  isOpen,
  onClose,
  editWorkoutId,
  workoutForm,
  setWorkoutForm,
  onSave,
  saving = false,
}: WorkoutPlanModalProps) {
  //
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editWorkoutId ? "Edit Workout Plan" : "Create Workout Plan"}
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
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
            <ClipboardList size={16} className="text-orange-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Info</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
              <input className={inp} value={workoutForm.name}
                onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                placeholder="e.g. Strength Builder" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workout Type</label>
              <input className={inp} value={workoutForm.type}
                onChange={(e) => setWorkoutForm({ ...workoutForm, type: e.target.value })}
                placeholder="e.g. Strength, Cardio, HIIT" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-orange-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Focus & Description</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Focus</label>
              <input className={inp} value={workoutForm.focus}
                onChange={(e) => setWorkoutForm({ ...workoutForm, focus: e.target.value })}
                placeholder="e.g. Muscle Building, Fat Loss" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all resize-none h-20"
                value={workoutForm.description}
                onChange={(e) => setWorkoutForm({ ...workoutForm, description: e.target.value })}
                placeholder="Describe the workout program" />
            </div>
          </div>
        </div>

        {/* Workout Days */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Dumbbell size={16} className="text-orange-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Training Days</span>
            </div>
            <button
              onClick={() => setWorkoutForm({
                ...workoutForm,
                workout_details: [...workoutForm.workout_details, { day: String(workoutForm.workout_details.length + 1), workouts: [] }]
              })}
              className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <Plus size={14} />
              Add Day
            </button>
          </div>

          <div className="space-y-3">
            {workoutForm.workout_details.map((dayDetail, dIndex) => (
              <div key={dIndex} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 relative">
                <button
                  onClick={() => {
                    const newDetails = [...workoutForm.workout_details];
                    newDetails.splice(dIndex, 1);
                    setWorkoutForm({ ...workoutForm, workout_details: newDetails });
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 outline-none focus:border-orange-400 transition-all"
                    value={dayDetail.day || ""}
                    onChange={(e) => {
                      const newDetails = [...workoutForm.workout_details];
                      newDetails[dIndex].day = e.target.value;
                      setWorkoutForm({ ...workoutForm, workout_details: newDetails });
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
                    <label className="text-sm font-medium text-gray-700">Exercises</label>
                    <button
                      onClick={() => {
                        const newDetails = [...workoutForm.workout_details];
                        newDetails[dIndex].workouts.push({ target_body_part: "", name: "", no_of_sets: 3, reps: "10" });
                        setWorkoutForm({ ...workoutForm, workout_details: newDetails });
                      }}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-xs font-semibold"
                    >
                      <Plus size={12} />
                      Add Exercise
                    </button>
                  </div>

                  <div className="grid gap-2">
                    {dayDetail.workouts.map((ex, eIndex) => (
                      <div key={eIndex} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex-1 grid grid-cols-4 gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Target</span>
                            <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-orange-400 mt-1"
                              placeholder="Body part" value={ex.target_body_part}
                              onChange={(e) => {
                                const newDetails = [...workoutForm.workout_details];
                                newDetails[dIndex].workouts[eIndex].target_body_part = e.target.value;
                                setWorkoutForm({ ...workoutForm, workout_details: newDetails });
                              }} />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Exercise</span>
                            <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-orange-400 mt-1"
                              placeholder="Exercise name" value={ex.name}
                              onChange={(e) => {
                                const newDetails = [...workoutForm.workout_details];
                                newDetails[dIndex].workouts[eIndex].name = e.target.value;
                                setWorkoutForm({ ...workoutForm, workout_details: newDetails });
                              }} />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Sets</span>
                            <input type="number"
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-orange-400 mt-1"
                              value={ex.no_of_sets}
                              onChange={(e) => {
                                const newDetails = [...workoutForm.workout_details];
                                newDetails[dIndex].workouts[eIndex].no_of_sets = Number(e.target.value);
                                setWorkoutForm({ ...workoutForm, workout_details: newDetails });
                              }} />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Reps</span>
                            <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-orange-400 mt-1"
                              placeholder="e.g. 10-12" value={ex.reps}
                              onChange={(e) => {
                                const newDetails = [...workoutForm.workout_details];
                                newDetails[dIndex].workouts[eIndex].reps = e.target.value;
                                setWorkoutForm({ ...workoutForm, workout_details: newDetails });
                              }} />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newDetails = [...workoutForm.workout_details];
                            newDetails[dIndex].workouts.splice(eIndex, 1);
                            setWorkoutForm({ ...workoutForm, workout_details: newDetails });
                          }}
                          className="text-gray-400 hover:text-red-500 mt-5 p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
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
