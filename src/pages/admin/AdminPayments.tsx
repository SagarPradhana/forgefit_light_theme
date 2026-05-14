import { useState, useEffect } from "react";
import { useGymStore } from "../../store/gymStore";
import { useTranslation } from "react-i18next";
import {
  GlassCard,
  GlowButton,
  SectionTitle,
  Skeleton,
  Table,
  EmptyState,
  StatusBadge,
  CommonButton,
  Pagination,
  ButtonLoader,
  LoadingOverlay,
  InlineSpinner,
} from "../../components/ui/primitives";
import { Edit2, Trash2, Printer, FileText, Download } from "lucide-react";
import { adminPaymentService, type PaymentResponse, type PaymentMethod, type PaymentStatus, type PurchaseType } from "../../services/adminPaymentService";
import { adminProductService } from "../../services/adminProductService";
import { adminSubscriptionService, type PlanResponse } from "../../services/adminSubscriptionService";
import { getCurrencySymbol } from "../../utils/currency";
import { toast } from "../../store/toastStore";
import { DeleteConfirmationModal } from "../../components/common/DeleteConfirmationModal";
import { DateRangeFilter, type DateRange } from "../../components/ui/DateRangeFilter";
import { InvoiceModal } from "../../components/admin/users/InvoiceModal";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { API_ENDPOINTS } from "../../utils/url";
import { api } from "../../utils/httputils";
import { PaymentModal } from "../../components/admin/payments/PaymentModal";

export function AdminPayments() {
  const { t } = useTranslation();
  const { appConfig } = useGymStore();
  const currencySymbol = getCurrencySymbol(appConfig?.currency || "INR");

  const [fetchedPayments, setFetchedPayments] = useState<PaymentResponse[]>([]);
  const [paymentsMeta, setPaymentsMeta] = useState({
    page_no: 1,
    total_count: 0,
    page_size: 10,
    has_next: false,
    has_previous: false
  });
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"All" | "Paid" | "Pending">("All");
  const [paymentDateRange, setPaymentDateRange] = useState<DateRange>({ label: "This Month" });

  const [paymentModalOpen, setModalOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<string | null>(null);
  const [usersDropdown, setUsersDropdown] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<PlanResponse[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<any[]>([]);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: any } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalBootstrapping, setModalBootstrapping] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    user_id: "",
    amount: "0",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "cash" as PaymentMethod,
    status: "paid" as PaymentStatus,
    purchase_type: "product" as PurchaseType,
    purchase_id: "",
    purchase_details: { additionalProp1: {} } as any
  });

  const fetchPayments = async (p = paymentsMeta.page_no || 1) => {
    setPaymentsLoading(true);
    try {
      const currentPage = Number(p) || 1;
      const pageSize = Number(paymentsMeta.page_size) || 10;
      const offset = (currentPage - 1) * pageSize;

      const res = await adminPaymentService.getPayments({
        count: pageSize,
        offset,
        status: paymentStatus !== "All" ? paymentStatus.toLowerCase() as any : undefined,
        from_date: paymentDateRange.from_date,
        to_date: paymentDateRange.to_date,
      });

      if (res && res.data) {
        const totalCount = Number(
          res.total_count ?? res.count ?? res.data.length ?? 0
        );
        setFetchedPayments(res.data);
        setPaymentsMeta({
          page_no: Math.floor(offset / pageSize) + 1,
          total_count: totalCount,
          page_size: pageSize,
          has_next: offset + pageSize < totalCount,
          has_previous: offset > 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchDropdownUsers = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.GET_USERS_DROPDOWN) as any;
      if (res && res.data) setUsersDropdown(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const res = await adminSubscriptionService.getPlans({ count: 100 });
      if (res && res.data) setSubscriptionPlans(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProductsForDropdown = async () => {
    try {
      const res = await adminProductService.getProducts({ count: 100 });
      if (res && res.data) setFetchedProducts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [paymentStatus, paymentDateRange]);

  const bootstrapPaymentModal = async (payment?: PaymentResponse) => {
    setModalBootstrapping(true);
    try {
      await Promise.all([
        fetchDropdownUsers(),
        fetchProductsForDropdown(),
        fetchSubscriptionPlans(),
      ]);

      if (payment) {
        setEditPayment(payment.id);
        setPaymentForm({
          user_id: payment.user_id,
          amount: String(payment.amount),
          payment_date: new Date(payment.payment_date * 1000).toISOString().split('T')[0],
          payment_method: payment.payment_method as PaymentMethod,
          status: payment.status as PaymentStatus,
          purchase_type: payment.purchase_type as PurchaseType,
          purchase_id: payment.purchase_id,
          purchase_details: payment.purchase_details || { additionalProp1: {} }
        });
      } else {
        setPaymentForm({
          user_id: "",
          amount: "0",
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: "cash" as PaymentMethod,
          status: "paid" as PaymentStatus,
          purchase_type: "product" as PurchaseType,
          purchase_id: "",
          purchase_details: { additionalProp1: {} }
        });
        setEditPayment(null);
      }

      setModalOpen(true);
    } finally {
      setModalBootstrapping(false);
    }
  };

  const handleExportPDF = async () => {
    if (!fetchedPayments.length) {
      toast.error("No data to export");
      return;
    }
    setExportingPdf(true);
    try {
      const doc = new jsPDF();
      doc.text(`Payments Report-${new Date().toLocaleDateString()}`, 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [["Username", "Name", "Mobile", "Date", "Amount", "Method", "Type", "Status"]],
        body: fetchedPayments.map((p) => [
          p.username || "System",
          (p as any).name || p.Name || "N/A",
          p.mobile || "N/A",
          new Date(p.payment_date * 1000).toLocaleDateString(),
          p.amount.toString(),
          p.payment_method,
          p.purchase_type,
          p.status
        ]),
      });
      doc.save(`Payments_Report-${new Date().toLocaleDateString()}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    if (!fetchedPayments.length) {
      toast.error("No data to export");
      return;
    }
    setExportingExcel(true);
    try {
      const data = fetchedPayments.map((p) => ({
        Username: p.username || "System",
        Name: (p as any).name || p.Name || "N/A",
        Mobile: p.mobile || "N/A",
        Date: new Date(p.payment_date * 1000).toLocaleDateString(),
        Amount: p.amount,
        Method: p.payment_method,
        Type: p.purchase_type,
        Status: p.status
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
      XLSX.writeFile(workbook, `Payments_Report-${new Date().toLocaleDateString()}.xlsx`);
    } finally {
      setExportingExcel(false);
    }
  };

  const lastPage = Math.ceil(paymentsMeta.total_count / paymentsMeta.page_size) || 1;

  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <SectionTitle
          title={t("payments")}
          subtitle="Secure transaction ledger with multi-dimensional filtering."
        />
        <GlowButton
          onClick={() => bootstrapPaymentModal()}
          disabled={modalBootstrapping}
        >
          <ButtonLoader label={t("createNewPayment")} loadingLabel="Preparing" loading={modalBootstrapping} />
        </GlowButton>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t("transactionStatus")}</label>
          <select
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500 transition"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
          >
            <option value="All">{t("allTransactions")}</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <DateRangeFilter
          defaultPreset="monthly"
          onChange={(r) => setPaymentDateRange(r)}
        />
        <div className="flex gap-2 ml-auto">
          <CommonButton variant="ghost" onClick={handleExportPDF} disabled={exportingPdf} className="flex items-center gap-2">
            {exportingPdf ? <InlineSpinner size={16} /> : <FileText size={16} />} PDF
          </CommonButton>
          <CommonButton variant="ghost" onClick={handleExportExcel} disabled={exportingExcel} className="flex items-center gap-2 text-emerald-600">
            {exportingExcel ? <InlineSpinner size={16} /> : <Download size={16} />} Excel
          </CommonButton>
        </div>
      </div>

      {paymentsLoading && fetchedPayments.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : fetchedPayments.length > 0 ? (
        <div className="relative">
          <Table
            columns={[
              {
                key: "name",
                label: t("name"),
                render: (p) => <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight italic">{(p as any).name || p.Name || '--'}</span>
              },
              {
                key: "contact",
                label: t("contact"),
                render: (p) => <span className="text-[10px] font-bold text-indigo-600 tracking-widest">{p.mobile || '--'}</span>
              },
              {
                key: "timestamp",
                label: t("timestamp"),
                render: (p) => (
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {new Date(p.payment_date * 1000).toLocaleDateString()}
                  </span>
                )
              },
              {
                key: "valuation",
                label: t("valuation"),
                render: (p) => <span className="text-emerald-600 font-bold italic">{currencySymbol}{p.amount}</span>
              },
              {
                key: "method",
                label: t("method"),
                render: (p) => <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-widest">{p.payment_method}</span>
              },
              {
                key: "type",
                label: t("type"),
                render: (p) => <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{p.purchase_type}</span>
              },
              {
                key: "status",
                label: t("status"),
                render: (p) => <StatusBadge status={p.status.charAt(0).toUpperCase() + p.status.slice(1) as any} />
              },
              {
                key: "operations",
                label: t("operations"),
                render: (p) => (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => bootstrapPaymentModal(p)}
                      className={`${p.purchase_type === "subscription" ? "text-[var(--text-secondary)] cursor-not-allowed pointer-events-none" : "text-indigo-600 hover:text-indigo-700"}`}
                      title={p.purchase_type === "subscription" ? t("cannotEditSubPayment") : t("editPayment")}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget({ type: "payment", id: p.id });
                        setDeleteModalOpen(true);
                      }}
                      className={`${p.purchase_type === "subscription" ? "text-[var(--text-secondary)] cursor-not-allowed pointer-events-none" : "text-red-600 hover:text-red-700"}`}
                      title={p.purchase_type === "subscription" ? t("cannotDeleteSubPayment") : t("deletePayment")}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setInvoiceModalOpen(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-700"
                      title={t("downloadInvoice")}
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                )
              }
            ]}
            data={fetchedPayments}
          />
          <LoadingOverlay show={paymentsLoading && fetchedPayments.length > 0} label="Refreshing payments" compact />

          <Pagination
            currentPage={paymentsMeta.page_no}
            totalPages={lastPage}
            hasPrev={paymentsMeta.has_previous}
            hasNext={paymentsMeta.has_next}
            onPrev={() => fetchPayments(paymentsMeta.page_no - 1)}
            onNext={() => fetchPayments(paymentsMeta.page_no + 1)}
          />
        </div>
      ) : (
        <EmptyState
          title="Financial Static"
          hint="No transaction signals detected for the selected parameters."
        />
      )}

      {/* Create/Edit Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setModalOpen(false)}
        editPaymentId={editPayment}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        usersDropdown={usersDropdown}
        subscriptionPlans={subscriptionPlans}
        fetchedProducts={fetchedProducts}
        currencySymbol={currencySymbol}
        onSuccess={() => fetchPayments(1)}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen && deleteTarget?.type === "payment"}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          if (deleteTarget && deleteTarget.type === "payment") {
            setDeleteLoading(true);
            try {
              await adminPaymentService.deletePayment(deleteTarget.id);
              toast.success("Transaction purged successfully");
              fetchPayments(paymentsMeta.page_no);
            } catch (err) {
              toast.error("Purge failed");
            } finally {
              setDeleteLoading(false);
            }
          }
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title="Registry Purge"
        description="This financial record will be permanently erased from the master ledger."
        confirmLabel="Submit"
        isProcessing={deleteLoading}
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />
    </GlassCard>
  );
}
