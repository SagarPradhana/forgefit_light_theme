import { useState } from "react";
import { Modal, GlowButton, ButtonLoader } from "../../ui/primitives";
import { toast } from "../../../store/toastStore";
import { adminPaymentService, type PaymentMethod, type PaymentStatus, type PurchaseType } from "../../../services/adminPaymentService";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!paymentForm.user_id) newErrors.user_id = t("fieldRequired");
    if (!paymentForm.purchase_id) newErrors.purchase_id = t("fieldRequired");
    if (!paymentForm.payment_date) newErrors.payment_date = t("fieldRequired");
    if (Number(paymentForm.amount) <= 0) newErrors.amount = t("amountMustBePositive");
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error(t("pleaseFixErrors"));
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
        toast.success("Financial record updated");
      } else {
        await adminPaymentService.createPayment(payload);
        toast.success("New transaction logged");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Process failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editPaymentId ? t("financialAdjustment") : t("logTransaction")}
      footer={
        <>
          <GlowButton variant="secondary" onClick={onClose} disabled={submitting}>{t("cancel")}</GlowButton>
          <GlowButton onClick={handleSubmit} disabled={submitting}>
            <ButtonLoader label={t("submit")} loadingLabel={t("loading")} loading={submitting} />
          </GlowButton>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("selectMember")}</label>
          <select
            className={`w-full rounded-xl bg-[var(--bg-secondary)] border p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition font-bold ${errors.user_id ? "border-red-500" : "border-[var(--border-subtle)]"}`}
            value={paymentForm.user_id}
            onChange={(e) => {
              setPaymentForm({ ...paymentForm, user_id: e.target.value });
              if (errors.user_id) setErrors({ ...errors, user_id: "" });
            }}
          >
            <option value="">{t("chooseRegistryEntity")}</option>
            {usersDropdown.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} (@{u.username || u.member_id})</option>
            ))}
          </select>
          {errors.user_id && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.user_id}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("purchaseType")}</label>
          <select
            className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition font-bold uppercase"
            value={paymentForm.purchase_type}
            onChange={(e) => setPaymentForm({ ...paymentForm, purchase_type: e.target.value as any, purchase_id: "", amount: "0" })}
          >
            <option value="product">{t("product")}</option>
            <option value="subscription">{t("subscription")}</option>
          </select>
        </div>

        {paymentForm.purchase_type === "product" && (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("selectInventoryItem")}</label>
            <select
              className={`w-full rounded-xl bg-[var(--bg-secondary)] border p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition font-bold ${errors.purchase_id ? "border-red-500" : "border-[var(--border-subtle)]"}`}
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
              <option value="">{t("chooseProduct")}</option>
              {fetchedProducts.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({currencySymbol}{p.price})</option>
              ))}
            </select>
            {errors.purchase_id && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.purchase_id}</p>}
          </div>
        )}

        {paymentForm.purchase_type === "subscription" && (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("selectSubscriptionPlan")}</label>
            <select
              className={`w-full rounded-xl bg-[var(--bg-secondary)] border p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition font-bold ${errors.purchase_id ? "border-red-500" : "border-[var(--border-subtle)]"}`}
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
              <option value="">{t("chooseSubscriptionPlan")}</option>
              {subscriptionPlans.map((pl: any) => (
                <option key={pl.id} value={pl.id}>{pl.name} - {pl.duration_in_months} months ({currencySymbol}{pl.price})</option>
              ))}
            </select>
            {errors.purchase_id && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.purchase_id}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("transactionValue")} ({currencySymbol})</label>
            <input
              className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 text-[var(--text-muted)] font-bold cursor-not-allowed"
              type="text"
              value={paymentForm.amount}
              readOnly
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("entryDate")}</label>
            <input
              className={`w-full rounded-xl bg-[var(--bg-secondary)] border p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition font-bold ${errors.payment_date ? "border-red-500" : "border-[var(--border-subtle)]"}`}
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={paymentForm.payment_date}
              onChange={(e) => {
                setPaymentForm({ ...paymentForm, payment_date: e.target.value });
                if (errors.payment_date) setErrors({ ...errors, payment_date: "" });
              }}
            />
            {errors.payment_date && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.payment_date}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("strategicMethod")}</label>
            <select
              className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition font-bold uppercase"
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
            >
              <option value="cash">{t("cash")}</option>
              <option value="card">{t("card")}</option>
              <option value="upi">{t("upi")}</option>
              <option value="other">{t("other")}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
            <select
              className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition font-bold uppercase"
              value={paymentForm.status}
              onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as any })}
            >
              <option value="paid">{t("paid")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="failed">{t("failed")}</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
