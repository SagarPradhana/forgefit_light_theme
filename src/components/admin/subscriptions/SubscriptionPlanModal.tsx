import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Modal, GlowButton, ButtonLoader } from "../../ui/primitives";
import { toast } from "../../../store/toastStore";
import { adminSubscriptionService } from "../../../services/adminSubscriptionService";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../../utils/formUtils";
import { Crown, IndianRupee, Calendar, FileText } from "lucide-react";
import { SuccessAnimation } from "../../ui/ActionAnimations";

interface SubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPlanId: string | null;
  planForm: {
    name: string;
    description: string;
    actual_price: string;
    price: string;
    duration_in_months: string;
  };
  setPlanForm: (form: any) => void;
  currencySymbol: string;
  onSuccess: () => void;
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all";
const sel = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all appearance-none cursor-pointer";

export function SubscriptionPlanModal({
  isOpen,
  onClose,
  editPlanId,
  planForm,
  setPlanForm,
  currencySymbol,
  onSuccess
}: SubscriptionPlanModalProps) {
  //
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { setSaveSuccess(false); }, [isOpen]);

  const handleSubmit = async () => {
    if (!planForm.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!planForm.price || Number(planForm.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (planForm.actual_price && Number(planForm.actual_price) < Number(planForm.price)) {
      toast.error("Original price cannot be less than the selling price");
      return;
    }

    setSaving(true);

    const payload = {
      name: planForm.name,
      description: planForm.description,
      actual_price: Number(planForm.actual_price),
      price: Number(planForm.price),
      duration_in_months: Number(planForm.duration_in_months),
    };

    try {
      if (editPlanId) {
        await adminSubscriptionService.updatePlan(editPlanId, payload);
      } else {
        await adminSubscriptionService.createPlan(payload);
      }
      setSaveSuccess(true);
      toast.success(editPlanId ? "Plan updated successfully" : "New subscription plan created");
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      toast.error("Failed to save plan. Please check the details.");
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
        {editPlanId ? "Plan Updated!" : "Plan Created!"}
      </motion.p>
      <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
    </motion.div>
  ) : (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crown size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Details</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
          <input className={inp} placeholder="e.g. Premium, VIP, Basic"
            value={planForm.name}
            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ({currencySymbol})</label>
            <input className={inp} type="text" placeholder="0"
              value={planForm.actual_price}
              onChange={(e) => setPlanForm({ ...planForm, actual_price: sanitizePhone(e.target.value) })}
              onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price ({currencySymbol}) <span className="text-red-500">*</span></label>
            <input className={inp} type="text" placeholder="0"
              value={planForm.price}
              onChange={(e) => setPlanForm({ ...planForm, price: sanitizePhone(e.target.value) })}
              onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Membership Period</label>
          <select className={sel} value={planForm.duration_in_months}
            onChange={(e) => setPlanForm({ ...planForm, duration_in_months: e.target.value })}>
            <option value="1">1 Month</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">1 Year</option>
          </select>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Description</label>
          <textarea className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all resize-none h-24"
            placeholder="Describe what's included in this plan"
            value={planForm.description}
            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editPlanId ? "Edit Subscription Plan" : "Add Subscription Plan"}
      footer={
        <>
          <GlowButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</GlowButton>
          <GlowButton onClick={handleSubmit} disabled={saving}>
            <ButtonLoader label="Save Plan" loadingLabel="Saving..." loading={saving} />
          </GlowButton>
        </>
      }
    >
      {modalContent}
    </Modal>
  );
}

