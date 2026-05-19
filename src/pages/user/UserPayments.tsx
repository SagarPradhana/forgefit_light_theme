import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useGymStore } from "../../store/gymStore";
import {
  GlassCard,
  SectionTitle,
  Skeleton,
  EmptyState,
  Table,
  StatusBadge
} from "../../components/ui/primitives";
import { BadgeDollarSign, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { appPaymentService, type AppPaymentResponse } from "../../services/appPaymentService";
import { DateRangeFilter, type DateRange } from "../../components/ui/DateRangeFilter";
import { getCurrencySymbol } from "../../utils/currency";

export function UserPayments() {
  const { t } = useTranslation();
  const { appConfig } = useGymStore();
  const currency = appConfig?.currency || "INR";
  const currencySymbol = getCurrencySymbol(currency);
  const { id: userId } = useAuthStore();

  const [fetchedPayments, setFetchedPayments] = useState<AppPaymentResponse[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentDateRange, setPaymentDateRange] = useState<DateRange>({ label: "This Month" });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");
  const [paymentPurchaseTypeFilter, setPaymentPurchaseTypeFilter] = useState<string>("");

  const fetchPayments = useCallback(async () => {
    if (!userId) return;
    setPaymentsLoading(true);
    try {
      const res = await appPaymentService.getPayments({
        user_id: userId!,
        from_date: paymentDateRange.from_date,
        to_date: paymentDateRange.to_date,
        status: (paymentStatusFilter || undefined) as any,
        payment_method: (paymentMethodFilter || undefined) as any,
        purchase_type: (paymentPurchaseTypeFilter || undefined) as any,
        count: 100,
        offset: 0,
        order_by: "payment_date",
        order_dir: "DESC",
      });
      if (res && res.data) {
        setFetchedPayments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [userId, paymentDateRange, paymentStatusFilter, paymentMethodFilter, paymentPurchaseTypeFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n ?? 0);
  const fmtPayDate = (ts: number) =>
    ts ? new Date(ts * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle title={t("payments")} subtitle="Your complete transaction history" />
        <div className="flex items-center gap-2">
          <DateRangeFilter
            defaultPreset="monthly"
            onChange={(r) => setPaymentDateRange(r)}
          />
          <button
            onClick={fetchPayments}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:bg-indigo-600 hover:border-indigo-600 text-indigo-600 hover:text-[var(--text-primary)] transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} className={paymentsLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-1">
          {["", "paid", "pending", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setPaymentStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${paymentStatusFilter === s
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-[var(--text-primary)] shadow-lg"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                }`}
            >
              {s || "All Status"}
            </button>
          ))}
        </div>

        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest outline-none cursor-pointer hover:border-indigo-600/50 transition-all"
        >
          <option value="" className="bg-[var(--bg-primary)]">All Methods</option>
          <option value="cash" className="bg-[var(--bg-primary)]">Cash</option>
          <option value="card" className="bg-[var(--bg-primary)]">Card</option>
          <option value="upi" className="bg-[var(--bg-primary)]">UPI</option>
          <option value="other" className="bg-[var(--bg-primary)]">Other</option>
        </select>

        <select
          value={paymentPurchaseTypeFilter}
          onChange={(e) => setPaymentPurchaseTypeFilter(e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest outline-none cursor-pointer hover:border-indigo-600/50 transition-all"
        >
          <option value="" className="bg-[var(--bg-primary)]">All Types</option>
          <option value="subscription" className="bg-[var(--bg-primary)]">Subscription</option>
          <option value="renewal" className="bg-[var(--bg-primary)]">Renewal</option>
          <option value="product" className="bg-[var(--bg-primary)]">Product</option>
          <option value="other" className="bg-[var(--bg-primary)]">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BadgeDollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Total Transactions</p>
            <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{fetchedPayments.length}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Total Paid</p>
            <p className="text-xl font-bold text-emerald-600 leading-none">
              {fmtCurrency(fetchedPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0))}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Pending</p>
            <p className="text-xl font-bold text-orange-600 leading-none">
              {fmtCurrency(fetchedPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + (p.amount || 0), 0))}
            </p>
          </div>
        </GlassCard>
      </div>

      {paymentsLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : fetchedPayments.length > 0 ? (
        <GlassCard>
          <Table
            headers={["Reference", "Date", "Purchase", "Method", "Amount", "Status"]}
            rows={fetchedPayments.map((p) => [
              <span key={`${p.id}-ref`} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">#{p.id.slice(-6)}</span>,
              <span key={`${p.id}-date`} className="text-xs font-bold text-[var(--text-muted)]">{fmtPayDate(p.payment_date)}</span>,
              <div key={`${p.id}-type`} className="flex flex-col">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight italic">{p.purchase_type}</span>
                <span className="text-[9px] text-[var(--text-muted)] truncate max-w-[150px]">
                  {p.purchase_details ? JSON.stringify(p.purchase_details).slice(0, 40) + "..." : "---"}
                </span>
              </div>,
              <span key={`${p.id}-method`} className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-tighter">{p.payment_method}</span>,
              <span key={`${p.id}-amt`} className="text-sm font-bold text-[var(--text-primary)] italic">{currencySymbol}{p.amount}</span>,
              <StatusBadge key={`${p.id}-status`} status={p.status.charAt(0).toUpperCase() + p.status.slice(1) as any} />
            ])}
          />
        </GlassCard>
      ) : (
        <EmptyState title="Financial Ledger Clean" hint="No transaction markers detected for the current selection." />
      )}
    </div>
  );
}
