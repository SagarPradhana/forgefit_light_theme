import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X, CreditCard, History, Plus, RefreshCw, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useGet, useMutation } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../utils/url";
import { toast } from "../../../store/toastStore";
import { useTranslation } from "react-i18next";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  plans: any[];
}

export const SubscriptionModal = ({ isOpen, onClose, selectedUser, plans }: SubscriptionModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"add" | "history">("add");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useGet(
    selectedUser ? `${API_ENDPOINTS.ADMIN.SUBSCRIPTION_HISTORY}?user_id=${selectedUser.id}` : null
  );
  const history = historyData?.data || [];

  const { mutate: subscribe, loading: subscribing } = useMutation("post", {
    onSuccess: () => {
      toast.success("Strategic membership activated");
      refetchHistory();
      setActiveTab("history");
    }
  });

  // Real-time end date calculation
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
      toast.error("Please select a target plan");
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-[101] w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] shadow-[var(--shadow-hover)] overflow-hidden"
      >
        <div className="p-10 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-card)]">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center text-white shadow-lg">
              <CreditCard size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{t("subscriptionManagement")}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">{selectedUser.name}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-all text-[var(--text-muted)] hover:text-[var(--accent-orange)] border border-[var(--border-subtle)]">
            <X size={24} />
          </button>
        </div>

        <div className="flex p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] shrink-0 gap-2">
          <button onClick={() => setActiveTab("add")} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${activeTab === "add" ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-xl" : "text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"}`}>
            <Plus size={18} /> {t("addPlan")}
          </button>
          <button onClick={() => setActiveTab("history")} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${activeTab === "history" ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white shadow-xl" : "text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"}`}>
            <History size={18} /> {t("history")}
          </button>
        </div>

        <div className="p-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {activeTab === "add" ? (
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 ml-1">Selection Protocol</label>
                  <div className="relative group">
                    <select 
                      value={selectedPlanId} 
                      onChange={(e) => handlePlanSelect(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl px-6 py-5 text-[var(--text-primary)] font-black text-sm appearance-none focus:outline-none focus:border-[var(--accent-orange)] transition-all hover:bg-[var(--bg-card-hover)]"
                    >
                      <option value="" className="bg-white">Select Strategic Tier...</option>
                      {plans.map((p: any) => (
                        <option key={p.id} value={p.id} className="bg-white">{p.name} — ₹{p.price}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors">
                      <Plus size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 ml-1">Payment Mode</label>
                  <div className="relative group">
                    <select 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl px-6 py-5 text-[var(--accent-orange)] font-black text-sm appearance-none focus:outline-none focus:border-[var(--accent-orange)] transition-all hover:bg-[var(--bg-card-hover)]"
                    >
                      <option value="cash" className="bg-white">Cash Settlement</option>
                      <option value="card" className="bg-white">Bank Card</option>
                      <option value="upi" className="bg-white">UPI Interface</option>
                      <option value="other" className="bg-white">Other Channels</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors">
                      <CreditCard size={16} />
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[var(--accent-orange)]/5 to-transparent border border-[var(--border-subtle)] space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-orange)]/5 blur-3xl rounded-full -mr-16 -mt-16" />
                   
                   <div className="flex items-center justify-between relative z-10">
                     <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Base Valuation</span>
                     <span className="text-2xl font-black text-[var(--text-primary)] italic">₹{amount}</span>
                   </div>
                   <div className="flex items-center justify-between relative z-10">
                     <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Calculated Span</span>
                     <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[var(--accent-orange)]" />
                        <span className="text-sm font-black text-[var(--text-secondary)]">{duration} Months</span>
                     </div>
                   </div>
                   <div className="h-px bg-[var(--border-subtle)] relative z-10" />
                   <div className="flex items-center justify-between relative z-10">
                     <div className="flex flex-col">
                       <span className="text-[10px] text-[var(--accent-orange)] font-black uppercase tracking-widest">Final Price</span>
                       <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-0.5 whitespace-nowrap">Standard Membership Rate</span>
                     </div>
                     <div className="flex items-center gap-2 bg-[var(--accent-orange)]/5 px-4 py-2 rounded-xl border border-[var(--accent-orange)]/10">
                       <span className="text-[var(--accent-orange)] font-black italic">₹</span>
                       <span className="text-[var(--text-primary)] font-black text-xl">{amount}</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Initiation</label>
                    <input type="date" max={new Date().toISOString().split('T')[0]} value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-2xl text-[var(--text-primary)] font-bold text-xs focus:outline-none focus:border-[var(--accent-orange)] transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-[var(--accent-orange)]/50 uppercase tracking-widest text-right mr-1">Termination</label>
                    <div className="p-4 text-right text-[var(--accent-orange)] font-black font-mono text-xs bg-[var(--accent-orange)]/5 rounded-2xl border border-[var(--accent-orange)]/20">
                      {endDate}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--accent-orange)]/5 border border-[var(--accent-orange)]/10 p-6 rounded-[1.5rem] flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[var(--accent-orange)]/10 flex items-center justify-center text-[var(--accent-orange)] shrink-0">
                    <Calendar size={20} />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed uppercase font-bold">
                    Automatic synchronization set for <span className="text-[var(--text-primary)] font-black">{endDate}</span>. 
                    <br />
                    <span className="text-[var(--accent-orange)]/80">Override capability active for custom strategic pricing.</span>
                  </p>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-6 py-5 rounded-[1.5rem] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-black uppercase text-[10px] tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)] transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={subscribing || !selectedPlanId}
                    onClick={handleSubscribe}
                    className="flex-[2] bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] py-5 rounded-[1.5rem] font-black uppercase text-[10px] italic tracking-[0.2em] text-white disabled:opacity-50 flex items-center justify-center gap-4 group transition-all"
                  >
                    {subscribing ? <Loader2 className="animate-spin" size={24} /> : (
                      <>
                        <CheckCircle2 size={24} className="group-hover:rotate-12 transition-transform" /> 
                        Submit
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {historyLoading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[var(--accent-orange)]" size={48} />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Retrieving Logs...</span>
                </div>
              ) : history.length > 0 ? (
                <div className="overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <table className="w-full text-left">
                    <thead className="bg-[var(--bg-primary)]">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Plan Designation</th>
                        <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Protocol Life</th>
                        <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Investment</th>
                        <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {history.map((sub: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                          <td className="px-8 py-5">
                            <p className="font-black text-[var(--text-primary)] uppercase tracking-tighter italic text-sm">{sub.plan_name}</p>
                            <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest mt-0.5">{sub.duration_in_months || sub.duration} Month Span</p>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[var(--text-secondary)] font-black font-mono text-[10px]">{new Date(sub.start_date * 1000).toLocaleDateString()}</span>
                                <div className="h-1 w-8 bg-[var(--accent-orange)]/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--accent-orange)] w-1/2" />
                                </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-[var(--accent-orange)] font-black text-sm italic">₹{sub.amount}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                Active Protocol
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-24 text-center">
                   <div className="h-24 w-24 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <History size={40} className="text-[var(--text-muted)]" />
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">No Active Protocols</h3>
                  <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[9px] mt-2 italic">Waiting for initial membership deployment</p>
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

