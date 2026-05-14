import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Table,
  StatusBadge,
  Skeleton,
  Pagination,
  InlineSpinner,
  LoadingOverlay,
} from "../../components/ui/primitives";
import { Trash2, CheckCircle, Search } from "lucide-react";
import { toast } from "../../store/toastStore";
import { adminInquiryService } from "../../services/adminInquiryService";
import { DeleteConfirmationModal } from "../common/DeleteConfirmationModal";

type InquiryType = "subscriptions" | "products" | "contacts" | "expiry";

const VALID_TABS: InquiryType[] = ["subscriptions", "products", "contacts", "expiry"];

export function InquiryCenter() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as InquiryType | null;
  const activeTab: InquiryType = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "subscriptions";
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, count: 10, offset: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [resolveTargetId, setResolveTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearchQuery || undefined,
        count: meta.count,
        offset: meta.offset,
      };

      let res;
      switch (activeTab) {
        case "subscriptions":
          res = await adminInquiryService.getSubscriptionInquiries(params);
          break;
        case "products":
          res = await adminInquiryService.getProductOrders(params);
          break;
        case "contacts":
          res = await adminInquiryService.getContactInquiries(params);
          break;
        case "expiry":
          res = await adminInquiryService.getExpiringMembers(params);
          break;
      }

      if (res && res.data) {
        setData(res.data);
        setMeta(prev => ({ ...prev, total: res.totalcount }));
      }
    } catch (err) {
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [activeTab, debouncedSearchQuery, meta.count, meta.offset]);

  useEffect(() => {
    setMeta((prev) => ({ ...prev, offset: 0 }));
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setMeta((prev) => ({ ...prev, offset: 0 }));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      switch (activeTab) {
        case "subscriptions": await adminInquiryService.deleteSubscriptionInquiry(deleteTargetId); break;
        case "products": await adminInquiryService.deleteProductOrder(deleteTargetId); break;
        case "contacts": await adminInquiryService.deleteContactInquiry(deleteTargetId); break;
        case "expiry": await adminInquiryService.deleteExpiringMemberRecord(deleteTargetId); break;
      }
      toast.success("Record deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Delete operation failed");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleResolve = async (id: string) => {
    setResolveTargetId(id);
    try {
      switch (activeTab) {
        case "subscriptions": await adminInquiryService.updateSubscriptionInquiry(id); break;
        case "products": await adminInquiryService.updateProductOrder(id); break;
        case "contacts": await adminInquiryService.updateContactInquiry(id); break;
        case "expiry": await adminInquiryService.updateExpiringMemberRecord(id); break;
      }
      toast.success("Record marked as resolved");
      fetchData();
    } catch (err) {
      toast.error("Resolve operation failed");
    } finally {
      setResolveTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white text-xs font-bold uppercase tracking-widest">
            {t(activeTab)}
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
            placeholder={t("searchRecords")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 px-1">
        {activeTab === "subscriptions" && <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t("subscriptionsTabSubtitle")}</p>}
        {activeTab === "products" && <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t("productsTabSubtitle")}</p>}
        {activeTab === "contacts" && <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t("contactsTabSubtitle")}</p>}
        {activeTab === "expiry" && <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t("expiryTabSubtitle")}</p>}
      </div>

      <div className="relative w-full min-h-[260px]">
        {initialLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: "name", label: t("name"), render: (r: any) => <span className="font-bold text-[var(--text-primary)] text-sm">{r.user_name || r.name || r.username || '—'}</span> },
                { key: "contact", label: t("mobileEmail"), render: (r: any) => <span className="text-xs text-[var(--text-muted)]">{r.user_mobile || r.email || '—'}</span> },
                ...(activeTab === "subscriptions" ? [{
                  key: "plan", label: t("requestedPlan"), render: (r: any) => (
                    <div>
                      <span className="text-[var(--accent-orange)] font-semibold text-xs">{r.plan_name || r.subscription_plan_name || `Plan: ${r.subscription_plan_id?.substring(0, 8)}…`}</span>
                      {r.description && <p className="text-[10px] text-[var(--text-muted)] mt-0.5 italic truncate max-w-[200px]">{r.description}</p>}
                    </div>
                  ),
                }] : []),
                ...(activeTab === "products" ? [
                  { key: "product", label: t("product"), render: (r: any) => (
                    <div>
                      <span className="text-[var(--accent-orange)] font-semibold text-xs">{r.product_name || r.product?.name || `Product: ${r.product_id?.substring(0, 8)}…`}</span>
                      {r.description && <p className="text-[10px] text-[var(--text-muted)] mt-0.5 italic truncate max-w-[200px]">{r.description}</p>}
                    </div>
                  )},
                  { key: "qty", label: t("qty"), render: (r: any) => <span className="font-bold text-lg">{r.quantity}</span> },
                ] : []),
                ...(activeTab === "contacts" ? [
                  { key: "subject", label: t("subjectObjective"), render: (r: any) => (
                    <div className="max-w-xs">
                      <p className="text-xs font-semibold text-[var(--accent-orange)] uppercase tracking-tight">{r.subject || t("contactMessage")}</p>
                      <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 italic">"{r.message}"</p>
                    </div>
                  )},
                ] : []),
                ...(activeTab === "expiry" ? [
                  { key: "timeline", label: t("timeline"), render: (r: any) => (
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-[var(--accent-orange)] leading-none">{r.remaining_days} {t("days")}</span>
                      <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{t("daysRemaining")}</span>
                    </div>
                  )},
                ] : []),
                { key: "date", label: t("date"), render: (r: any) => <span className="text-xs text-[var(--text-muted)]">{new Date((r.inquiry_date || r.created_date) * 1000).toLocaleDateString()}</span> },
                { key: "status", label: t("status"), render: (r: any) => <StatusBadge status={r.status ? t("resolved") as any : t("pending") as any} /> },
                { key: "actions", label: t("actions"), render: (r: any) => (
                  <div className="flex gap-2">
                    <button onClick={() => handleResolve(r.id)} disabled={resolveTargetId === r.id}
                      className="text-emerald-500 hover:scale-125 transition-transform disabled:opacity-60" title={t("resolve")}>
                      {resolveTargetId === r.id ? <InlineSpinner /> : <CheckCircle size={16} />}
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:scale-125 transition-transform" title={t("delete")}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )},
              ]}
              data={data}
              pagination={false}
              sortable={false}
            />

            <Pagination
              currentPage={Math.floor(meta.offset / meta.count) + 1}
              totalPages={Math.ceil((meta?.total || 0) / (meta?.count || 1))}
              hasPrev={meta.offset > 0}
              hasNext={meta.offset + meta.count < meta.total}
              onPrev={() => setMeta({ ...meta, offset: Math.max(0, meta.offset - meta.count) })}
              onNext={() => setMeta({ ...meta, offset: meta.offset + meta.count })}
            />
          </>
        )}
        <LoadingOverlay show={loading && !initialLoading} message="Refreshing records" />
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Record"
        description="This inquiry record will be permanently removed from the system."
        confirmLabel="Delete"
        isProcessing={deleteLoading}
      />
    </div>
  );
}
