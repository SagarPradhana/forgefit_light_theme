import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Modal, GlowButton, ButtonLoader } from "../../ui/primitives";
import { toast } from "../../../store/toastStore";
import { adminPaymentService, type PaymentMethod, type PaymentStatus, type PurchaseType } from "../../../services/adminPaymentService";
import { User, CreditCard, IndianRupee, ShoppingCart, Filter } from "lucide-react";
import { SuccessAnimation } from "../../ui/ActionAnimations";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPaymentId: string | null;
  paymentForm: {
    user_id: string;
    amount: string;
    payment_date: string;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    purchase_type: PurchaseType;
    purchase_id: string;
    purchase_details: any;
  };
  setPaymentForm: (form: any) => void;
  usersDropdown: any[];
  subscriptionPlans: any[];
  fetchedProducts: any[];
  currencySymbol: string;
  onSuccess: () => void;
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all";
const sel = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all appearance-none cursor-pointer";

export function PaymentModal({
  isOpen,
  onClose,
  editPaymentId,
  paymentForm,
  setPaymentForm,
  usersDropdown,
  subscriptionPlans,
  fetchedProducts,
  currencySymbol,
  onSuccess
}: PaymentModalProps) {
  //
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setSaveSuccess(false); }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!paymentForm.user_id) newErrors.user_id = "Please select a member";
    if (!paymentForm.purchase_id) newErrors.purchase_id = "Please select an item";
    if (!paymentForm.payment_date) newErrors.payment_date = "Please select a date";
    if (Number(paymentForm.amount) <= 0) newErrors.amount = "Amount must be positive";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...paymentForm,
      amount: Number(paymentForm.amount),
      payment_date: Math.floor(new Date(paymentForm.payment_date).getTime() / 1000)
    };
    try {
      if (editPaymentId) {
        await adminPaymentService.updatePayment(editPaymentId, payload);
      } else {
        await adminPaymentService.createPayment(payload);
      }
      setSaveSuccess(true);
      toast.success(editPaymentId ? "Payment record updated" : "Payment logged successfully");
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process payment");
      setSubmitting(false);
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
        {editPaymentId ? "Payment Updated!" : "Payment Recorded!"}
      </motion.p>
      <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
    </motion.div>
  ) : (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Member Details</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member <span className="text-red-500">*</span></label>
            <select className={`${sel} ${errors.user_id ? "border-red-400" : ""}`}
              value={paymentForm.user_id}
              onChange={(e) => {
                setPaymentForm({ ...paymentForm, user_id: e.target.value });
                if (errors.user_id) setErrors({ ...errors, user_id: "" });
              }}
            >
              <option value="">Select a member</option>
              {usersDropdown.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} (@{u.username || u.member_id})</option>
              ))}
            </select>
            {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Type</label>
            <div className="relative">
              <select className={sel} value={paymentForm.purchase_type}
                onChange={(e) => setPaymentForm({ ...paymentForm, purchase_type: e.target.value as any, purchase_id: "", amount: "0" })}>
                <option value="product">Product</option>
                <option value="subscription">Subscription</option>
              </select>
              <ShoppingCart size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</span>
        </div>
        {paymentForm.purchase_type === "product" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Product <span className="text-red-500">*</span></label>
            <select className={`${sel} ${errors.purchase_id ? "border-red-400" : ""}`}
              value={paymentForm.purchase_id}
              onChange={(e) => {
                const product = fetchedProducts.find(p => p.id === e.target.value);
                setPaymentForm({
                  ...paymentForm,
                  purchase_id: e.target.value,
                  amount: product ? String(product.price) : "0",
                  purchase_details: product ? { product_name: product.name, price: product.price, category: product.category } : { additionalProp1: {} }
                });
                if (errors.purchase_id) setErrors({ ...errors, purchase_id: "" });
              }}
            >
              <option value="">Choose a product</option>
              {fetchedProducts.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({currencySymbol}{p.price})</option>
              ))}
            </select>
            {errors.purchase_id && <p className="text-red-500 text-xs mt-1">{errors.purchase_id}</p>}
          </div>
        )}
        {paymentForm.purchase_type === "subscription" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan <span className="text-red-500">*</span></label>
            <select className={`${sel} ${errors.purchase_id ? "border-red-400" : ""}`}
              value={paymentForm.purchase_id}
              onChange={(e) => {
                const plan = subscriptionPlans.find(pl => pl.id === e.target.value);
                setPaymentForm({
                  ...paymentForm,
                  purchase_id: e.target.value,
                  amount: plan ? String(plan.price) : "0",
                  purchase_details: plan ? { plan_name: plan.name, price: plan.price, duration: plan.duration_in_months } : { additionalProp1: {} }
                });
                if (errors.purchase_id) setErrors({ ...errors, purchase_id: "" });
              }}
            >
              <option value="">Choose a plan</option>
              {subscriptionPlans.map((pl: any) => (
                <option key={pl.id} value={pl.id}>{pl.name} - {pl.duration_in_months} months ({currencySymbol}{pl.price})</option>
              ))}
            </select>
            {errors.purchase_id && <p className="text-red-500 text-xs mt-1">{errors.purchase_id}</p>}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({currencySymbol})</label>
            <div className="relative">
              <input className="pl-8 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed" type="text" value={paymentForm.amount} readOnly />
              <IndianRupee size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input className={`${inp} ${errors.payment_date ? "border-red-400" : ""}`} type="date"
              max={new Date().toISOString().split('T')[0]}
              value={paymentForm.payment_date}
              onChange={(e) => {
                setPaymentForm({ ...paymentForm, payment_date: e.target.value });
                if (errors.payment_date) setErrors({ ...errors, payment_date: "" });
              }} />
            {errors.payment_date && <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Details</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select className={sel} value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className={sel} value={paymentForm.status}
              onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as any })}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editPaymentId ? "Edit Payment" : "Record Payment"}
      footer={
        <>
          <GlowButton variant="secondary" onClick={onClose} disabled={submitting}>Cancel</GlowButton>
          <GlowButton onClick={handleSubmit} disabled={submitting}>
            <ButtonLoader label="Save Payment" loadingLabel="Saving..." loading={submitting} />
          </GlowButton>
        </>
      }
    >
      {modalContent}
    </Modal>
  );
}

