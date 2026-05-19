import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Plus, History, Loader2, Calendar, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useGet, useMutation } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../utils/url";
import { toast } from "../../../store/toastStore";
import { SuccessAnimation } from "../../ui/ActionAnimations";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  plans: any[];
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all";
const sel = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all appearance-none cursor-pointer";

export const SubscriptionModal = ({ isOpen, onClose, selectedUser, plans }: SubscriptionModalProps) => {
  const [activeTab, setActiveTab] = useState<"add" | "history">("add");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useGet(
    selectedUser ? `${API_ENDPOINTS.ADMIN.SUBSCRIPTION_HISTORY}?user_id=${selectedUser.id}` : null
  );
  const history = historyData?.data || [];

  const { mutate: subscribe, loading: subscribing } = useMutation("post", {
    onSuccess: () => {
      setSaveSuccess(true);
      toast.success("Subscription activated");
      refetchHistory();
    }
  });

  useEffect(() => { if (isOpen) setSaveSuccess(false); }, [isOpen]);
  useEffect(() => { if (saveSuccess) setTimeout(() => setActiveTab("history"), 1200); }, [saveSuccess]);

  useEffect(() => {
    const start = new Date(joiningDate);
    if (!isNaN(start.getTime())) {
      const end = new Date(start.setMonth(start.getMonth() + duration));
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, [joiningDate, duration]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("add");
      setSelectedPlanId("");
      setJoiningDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  if (!isOpen || !selectedUser) return null;

  const handleSubscribe = () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }
    const payload = {
      user_id: selectedUser.id,
      joining_date: Math.floor(new Date(joiningDate).getTime() / 1000),
      subscription_plan_id: selectedPlanId,
      duration_in_months: Number(duration),
      amount: Number(amount),
      payment_method: paymentMethod,
    };
    subscribe(API_ENDPOINTS.ADMIN.SUBSCRIPTION_CREATE, payload);
  };

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find((p: any) => p.id === planId);
    if (plan) {
      setSelectedPlanId(planId);
      setAmount(plan.price);
      setDuration(plan.duration_in_months || 1);
    } else {
      setSelectedPlanId("");
      setAmount(0);
      setDuration(1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <CreditCard className="text-orange-500" size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Subscription Management</h2>
              <p className="text-xs text-gray-500">{selectedUser.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex px-6 gap-2 border-b border-gray-100">
          <button onClick={() => setActiveTab("add")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === "add" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Plus size={14} className="inline mr-1.5" />Add Plan
          </button>
          <button onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === "history" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <History size={14} className="inline mr-1.5" />History
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {saveSuccess ? (
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
                Subscription Activated!
              </motion.p>
              <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
            </motion.div>
          ) : activeTab === "add" ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan <span className="text-red-500">*</span></label>
                  <select className={sel} value={selectedPlanId} onChange={(e) => handlePlanSelect(e.target.value)}>
                    <option value="">Choose a subscription plan</option>
                    {plans.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select className={sel} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Plan Amount</span>
                    <span className="text-lg font-bold text-gray-900">₹{amount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Duration</span>
                    <span className="text-sm font-semibold text-gray-700">{duration} Months</span>
                  </div>
                  <hr className="border-orange-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-orange-600">Total</span>
                    <span className="text-xl font-bold text-orange-600">₹{amount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" max={new Date().toISOString().split('T')[0]} className={inp}
                      value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                      <Calendar size={14} />
                      {endDate || "—"}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
                  <p>Subscription will auto-end on <span className="font-semibold text-gray-700">{endDate}</span></p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button disabled={subscribing || !selectedPlanId} onClick={handleSubscribe}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {subscribing ? <Loader2 size={16} className="animate-spin" /> : "Activate Subscription"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {historyLoading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                  <span className="text-xs text-gray-500 font-medium">Loading history...</span>
                </div>
              ) : history.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((sub: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">{sub.plan_name}</p>
                            <p className="text-xs text-gray-500">{new Date(sub.start_date * 1000).toLocaleDateString()}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">{sub.duration_in_months || sub.duration} months</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">₹{sub.amount}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <History size={40} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">No Subscription History</h3>
                  <p className="text-sm text-gray-500 mt-1">No past subscriptions found for this member</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

