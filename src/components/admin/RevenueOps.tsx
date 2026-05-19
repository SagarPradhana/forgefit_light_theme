import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, IndianRupee, BadgeDollarSign, ShoppingBag,
  RefreshCw, Search, ChevronLeft, ChevronRight,
  Users, Mail, Phone, CheckCircle, XCircle, Filter,
} from "lucide-react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { API_ENDPOINTS } from "../../utils/url";
import { api } from "../../utils/httputils";
import { GlassCard, SectionTitle } from "../ui/primitives";
import { DateRangeFilter, type DateRange } from "../ui/DateRangeFilter";
import { useGymStore } from "../../store/gymStore";
import { useTranslation } from "react-i18next";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RevenueStats {
  total_revenue: number;
  subscription_revenue: number;
  product_revenue: number;
  renewal_revenue: number;
}

interface PaymentRecord {
  id: string;
  user_id: string;
  name: string;
  username: string;
  mobile: string;
  email: string;
  amount: number;
  payment_date: number;
  payment_method: string;
  status: string;
  purchase_type: string;
  purchase_id: string;
  purchase_details: Record<string, any>;
  created_date: number;
  updated_date: number;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiry_date: number;
  status: boolean;
  created_date: number;
  updated_date: number;
}

type Tab = "all" | "subscriptions" | "products" | "inquiries";

const PAYMENT_METHODS = ["cash", "card", "upi", "other"];
const PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (ts: number) =>
  ts ? new Date(ts * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const createFmt = (currency: string) => (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

const toUnix = (dateStr: string, endOfDay = false) => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, delay, currency = "INR" }: {
  label: string; value: number; icon: any; color: string; delay: number; currency?: string;
}) {
  const fmt = createFmt(currency);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl hover:border-white/20 transition-all group"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${color}`} />
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color} bg-opacity-20 mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-black text-white tracking-tight">{fmt(value)}</p>
    </motion.div>
  );
}

// ─── AM5 Bar Chart ──────────────────────────────────────────────────────────
function AM5BarChart({ data, currency = "INR" }: { data: any[]; currency?: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Dispose previous root if it exists
    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }

    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);
    root._logo?.dispose();

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, { layout: root.verticalLayout, paddingBottom: 0 })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        numberFormatter: am5.NumberFormatter.new(root, { numberFormat: "₹#a" }),
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        categoryField: "month_label",
      })
    );
    xAxis.data.setAll(data);

    function createSeries(name: string, field: string, color: string) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: field,
          categoryXField: "month_label",
          tooltip: am5.Tooltip.new(root, { labelText: "{name}: ₹{valueY}" }),
          clustered: true,
        })
      );
      series.columns.template.setAll({
        fill: am5.color(color),
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        width: am5.percent(70),
      });
      series.data.setAll(data);
    }

    createSeries("Subscriptions", "subscription_revenue", "#d4a853");
    createSeries("Products", "product_revenue", "#b8953f");
    createSeries("Renewals", "renewal_revenue", "#f59e0b");

    chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));

    const legend = chart.children.push(
      am5.Legend.new(root, { centerX: am5.p50, x: am5.p50, paddingTop: 8 })
    );
    legend.data.setAll(chart.series.values);

    return () => { root.dispose(); rootRef.current = null; };
  }, [data]);

  useEffect(() => {
    return () => { if (rootRef.current) { rootRef.current.dispose(); rootRef.current = null; } };
  }, []);

  return <div ref={chartRef} className="w-full h-64" />;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ value, green, red }: { value: string; green?: string[]; red?: string[] }) {
  const v = value?.toLowerCase?.() ?? "";
  const isGreen = green?.includes(v);
  const isRed = red?.includes(v);
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isGreen ? "bg-emerald-500/20 text-emerald-400" :
        isRed ? "bg-red-500/20 text-red-400" :
          "bg-indigo-500/20 text-indigo-300"
      }`}>
      {value || "—"}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RevenueOps() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange>({ label: "This Month" });
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [page, setPage] = useState(1);

  // Data states
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiriesTotal, setInquiriesTotal] = useState(0);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [revenueMonths, setRevenueMonths] = useState(6);
  const [revenueLoading, setRevenueLoading] = useState(false);

  const { appConfig } = useGymStore();
  const currency = appConfig?.currency || "INR";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter changes
  useEffect(() => { setPage(1); }, [activeTab, dateRange, paymentMethod]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from_date) params.set("from_date", String(dateRange.from_date));
      if (dateRange.to_date) params.set("to_date", String(dateRange.to_date));
      const res: any = await api.get(`${API_ENDPOINTS.ADMIN.REVENUE_STATS}?${params}`);
      if (res?.data) setStats(res.data);
    } catch (e) { console.error(e); } finally { setStatsLoading(false); }
  }, [dateRange]);

  // Fetch Payments (all / subscriptions / products)
  const fetchPayments = useCallback(async () => {
    if (activeTab === "inquiries") return;
    setPaymentsLoading(true);
    try {
      const endpoint =
        activeTab === "subscriptions" ? API_ENDPOINTS.ADMIN.REVENUE_PAYMENTS_SUBSCRIPTIONS :
          activeTab === "products" ? API_ENDPOINTS.ADMIN.REVENUE_PAYMENTS_PRODUCTS :
            API_ENDPOINTS.ADMIN.REVENUE_PAYMENTS;
      const params = new URLSearchParams({
        offset: String((page - 1) * PAGE_SIZE),
        count: String(PAGE_SIZE),
      });
      if (dateRange.from_date) params.set("from_date", String(dateRange.from_date));
      if (dateRange.to_date) params.set("to_date", String(dateRange.to_date));
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (paymentMethod) params.set("payment_method", paymentMethod);
      const res: any = await api.get(`${endpoint}?${params}`);
      if (res?.data) {
        setPayments(res.data);
        setPaymentsTotal(res.totalcount ?? res.count ?? 0);
      }
    } catch (e) { console.error(e); } finally { setPaymentsLoading(false); }
  }, [activeTab, page, dateRange, debouncedSearch, paymentMethod]);

  // Fetch Contact Inquiries
  const fetchInquiries = useCallback(async () => {
    if (activeTab !== "inquiries") return;
    setInquiriesLoading(true);
    try {
      const params = new URLSearchParams({
        offset: String((page - 1) * PAGE_SIZE),
        count: String(PAGE_SIZE),
      });
      if (dateRange.from_date) params.set("from_date", String(dateRange.from_date));
      if (dateRange.to_date) params.set("to_date", String(dateRange.to_date));
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res: any = await api.get(`${API_ENDPOINTS.ADMIN.REVENUE_CONTACT_INQUIRIES}?${params}`);
      if (res?.data) {
        setInquiries(res.data);
        setInquiriesTotal(res.totalcount ?? res.count ?? 0);
      }
    } catch (e) { console.error(e); } finally { setInquiriesLoading(false); }
  }, [activeTab, page, dateRange, debouncedSearch]);

  // Fetch Monthly Revenue
  const fetchMonthlyRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const res: any = await api.get(`${API_ENDPOINTS.ADMIN.DASHBOARD_MONTHLY_REVENUE}?months=${revenueMonths}`);
      if (res?.data) setMonthlyRevenue(res.data);
    } catch (e) { console.error(e); } finally { setRevenueLoading(false); }
  }, [revenueMonths]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);
  useEffect(() => { fetchMonthlyRevenue(); }, [fetchMonthlyRevenue]);

  const isLoading = statsLoading || paymentsLoading || inquiriesLoading;
  const totalPages = activeTab === "inquiries"
    ? Math.ceil(inquiriesTotal / PAGE_SIZE)
    : Math.ceil(paymentsTotal / PAGE_SIZE);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "all", label: t("allPayments"), icon: IndianRupee },
    { id: "subscriptions", label: t("subscriptions"), icon: BadgeDollarSign },
    { id: "products", label: t("products"), icon: ShoppingBag },
    { id: "inquiries", label: t("inquiries"), icon: Mail },
  ];

  return (
    <GlassCard>
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <SectionTitle
          title={t("revenueOps")}
          subtitle={t("revenueOpsSubtitle")}
        />

        {/* Global Date Range Filter */}
        <div className="flex items-center gap-2">
          <DateRangeFilter
            defaultPreset="monthly"
            onChange={(r) => setDateRange(r)}
          />
          <button
            onClick={() => { fetchStats(); fetchPayments(); fetchInquiries(); }}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500 hover:border-indigo-500 text-indigo-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label={t("totalRevenue")} value={stats.total_revenue} icon={TrendingUp} color="bg-indigo-500" delay={0} currency={currency} />
          <StatCard label={t("subscriptionRevenue")} value={stats.subscription_revenue} icon={BadgeDollarSign} color="bg-violet-500" delay={0.05} currency={currency} />
          <StatCard label={t("productRevenue")} value={stats.product_revenue} icon={ShoppingBag} color="bg-amber-500" delay={0.1} currency={currency} />
          <StatCard label={t("renewalRevenue")} value={stats.renewal_revenue} icon={RefreshCw} color="bg-emerald-500" delay={0.15} currency={currency} />
        </div>
      )}

      {/* ── Monthly Revenue Bar Chart ── */}
      <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">{t("monthlyRevenue")}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("monthlyRevenueSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {[3, 6, 12].map((m) => (
              <button key={m} onClick={() => setRevenueMonths(m)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${revenueMonths === m ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 hover:text-white border border-white/10"}`}>
                {m}M
              </button>
            ))}
          </div>
        </div>
        {revenueLoading ? (
          <div className="h-64 rounded-xl bg-[var(--bg-secondary)] animate-pulse" />
        ) : monthlyRevenue.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-[var(--text-muted)]">
            <TrendingUp size={40} className="opacity-20" /><p className="text-sm font-bold">{t("noRevenueData")}</p>
          </div>
        ) : (
          <AM5BarChart data={monthlyRevenue} currency={currency} />
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-6 overflow-x-auto custom-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === id
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={activeTab === "inquiries" ? t("searchInquiriesPlaceholder") : t("searchRevenuePlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>
        {activeTab !== "inquiries" && (
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-500 transition cursor-pointer appearance-none"
            >
              <option value="" className="bg-white">{t("allMethods")}</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m} className="bg-white capitalize">{m}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Payment Table ── */}
      {activeTab !== "inquiries" && (
        <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {[t("nameMobileEmail"), t("amount"), t("method"), t("type"), t("status"), t("date")].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <IndianRupee size={40} className="opacity-20" />
                      <p className="text-sm font-bold">{t("noPaymentsFound")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-xs font-black text-white shrink-0">
                          {p.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{p.name || "—"}</p>
                          <p className="text-[10px] text-slate-500">{p.email || p.mobile || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-black text-sm">{fmt(p.amount)}</td>
                    <td className="px-4 py-3"><Badge value={p.payment_method} green={["cash", "upi"]} /></td>
                    <td className="px-4 py-3"><Badge value={p.purchase_type} /></td>
                    <td className="px-4 py-3"><Badge value={p.status} green={["paid", "success", "completed"]} red={["failed", "pending"]} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(p.payment_date)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Inquiries Table ── */}
      {activeTab === "inquiries" && (
        <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Name, mobile/email", "Subject", "Message", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inquiriesLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <Mail size={40} className="opacity-20" />
                      <p className="text-sm font-bold">{t("noInquiriesFound")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                inquiries.map((inq, idx) => (
                  <motion.tr
                    key={inq.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-xs font-black text-violet-300 shrink-0">
                          {inq.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{inq.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Mail size={9} />{inq.email}</span>
                            {inq.phone && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Phone size={9} />{inq.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-indigo-300 max-w-[140px] truncate">{inq.subject || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{inq.message || "—"}</td>
                    <td className="px-4 py-3">
                      {inq.status
                        ? <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-black"><CheckCircle size={12} />{t("resolved")}</span>
                        : <span className="flex items-center gap-1 text-amber-400 text-[10px] font-black"><XCircle size={12} />{t("pending")}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(inq.inquiry_date)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
            {t("pageOf", { current: page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
