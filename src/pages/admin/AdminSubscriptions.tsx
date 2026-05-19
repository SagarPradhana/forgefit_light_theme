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
  Modal
} from "../../components/ui/primitives";
import { Search, Edit2, Trash2 } from "lucide-react";
import { adminSubscriptionService, type PlanResponse } from "../../services/adminSubscriptionService";
import { getCurrencySymbol } from "../../utils/currency";
import { toast } from "../../store/toastStore";
import { DeleteConfirmationModal } from "../../components/common/DeleteConfirmationModal";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../utils/formUtils";
import { SubscriptionPlanModal } from "../../components/admin/subscriptions/SubscriptionPlanModal";

const getDurationLabel = (months: number) => {
  if (!months) return "1 Month";
  if (months === 1) return "1 Month";
  if (months === 3) return "3 Months";
  if (months === 6) return "6 Months";
  if (months === 12) return "1 Year";
  return `${months} Months`;
};

export function AdminSubscriptions() {
  const { t } = useTranslation();
  const { appConfig } = useGymStore();
  const currency = appConfig?.currency || "INR";
  const currencySymbol = getCurrencySymbol(currency);

  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [plansMeta, setPlansMeta] = useState({
    page_no: 1,
    total_count: 0,
    page_size: 10,
    has_next: false,
    has_previous: false
  });
  const [planSearch, setPlanSearch] = useState("");
  const [plansLoading, setPlansLoading] = useState(false);
  const [editPlan, setEditPlan] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: any } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    actual_price: "",
    price: "",
    duration_in_months: "1",
  });

  const fetchPlans = async (p = plansMeta.page_no || 1, search = planSearch) => {
    setPlansLoading(true);
    try {
      const currentPage = Number(p) || 1;
      const pageSize = Number(plansMeta.page_size) || 10;
      const offset = (currentPage - 1) * pageSize;
      const res = await adminSubscriptionService.getPlans({ count: pageSize, offset, search });
      if (res && res.data) {
        setPlans(res.data);
        setPlansMeta({
          page_no: res.page_no || 1,
          total_count: res.total_count || 0,
          page_size: res.page_size || 10,
          has_next: res.has_next,
          has_previous: res.has_previous
        });
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchPlans(1), 300);
    return () => clearTimeout(timer);
  }, [planSearch]);

  const lastPage = Math.ceil(plansMeta.total_count / plansMeta.page_size) || 1;

  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <SectionTitle
          title={t("subscriptions")}
          subtitle={t("subscriptionsSubtitle") || "Manage gym membership plans and pricing strategies."}
        />
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder={t("search") || "Search plans..."}
              value={planSearch}
              onChange={(e) => setPlanSearch(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500 transition"
            />
          </div>
          <GlowButton
            className="w-full md:w-auto justify-center"
            onClick={() => {
              setPlanForm({ name: "", description: "", actual_price: "", price: "", duration_in_months: "1" });
              setEditPlan(null);
              setPlanModalOpen(true);
            }}
          >
            {t("createPlan") || "Create Plan"}
          </GlowButton>
        </div>
      </div>

      {plansLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : plans.length > 0 ? (
        <>
          <Table
            columns={[
              {
                key: "name",
                label: t("planDetails") || "Plan Details",
                render: (p) => <span className="font-bold text-[var(--text-primary)] uppercase tracking-tight">{p.name}</span>
              },
              {
                key: "actual_price",
                label: t("actualPrice") || "Actual Price",
                render: (p) => <span className="text-[var(--text-muted)] line-through text-xs">{currencySymbol}{p.actual_price}</span>
              },
              {
                key: "price",
                label: t("valuation") || "Selling Price",
                render: (p) => <span className="text-emerald-600 font-bold">{currencySymbol}{p.price}</span>
              },
              {
                key: "duration",
                label: t("duration") || "Duration",
                render: (p) => <span className="text-indigo-600 font-bold">{getDurationLabel(p.duration_in_months)}</span>
              },
              {
                key: "description",
                label: t("description") || "Description",
                render: (p) => <span className="text-[var(--text-muted)] text-xs truncate max-w-xs block">{p.description}</span>
              },
              {
                key: "actions",
                label: t("actions") || "Actions",
                render: (p) => (
                  <div className="flex gap-4">
                    <button
                      className="text-indigo-600 hover:text-indigo-700 transition-transform hover:scale-125"
                      onClick={() => {
                        setPlanForm({
                          name: p.name,
                          description: p.description,
                          actual_price: p.actual_price?.toString() || "",
                          price: p.price.toString(),
                          duration_in_months: p.duration_in_months.toString(),
                        });
                        setEditPlan(p.id);
                        setPlanModalOpen(true);
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-700 transition-transform hover:scale-125"
                      onClick={() => {
                        setDeleteTarget({ type: "plan", id: p.id });
                        setDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              }
            ]}
            data={plans}
          />

          {lastPage > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={!plansMeta.has_previous}
                onClick={() => fetchPlans(plansMeta.page_no - 1)}
                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-30"
              >
                {t("prev")}
              </button>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {t("pageOf", { current: plansMeta.page_no, total: lastPage })}
              </span>
              <button
                disabled={!plansMeta.has_next}
                onClick={() => fetchPlans(plansMeta.page_no + 1)}
                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-30"
              >
                {t("next")}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={t("protocolVacuum")}
          hint={planSearch ? t("noMembershipStrategyMatch", { search: planSearch }) : t("initMembershipTier")}
        />
      )}

      <SubscriptionPlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        editPlanId={editPlan}
        planForm={planForm}
        setPlanForm={setPlanForm}
        currencySymbol={currencySymbol}
        onSuccess={() => fetchPlans(1)}
      />

      {/* Delete Modal for Plans */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen && deleteTarget?.type === "plan"}
        onClose={() => setDeleteModalOpen(false)}
        isProcessing={deleteLoading}
        onConfirm={async () => {
          if (deleteTarget && deleteTarget.type === "plan") {
            setDeleteLoading(true);
            try {
              await adminSubscriptionService.deletePlan(deleteTarget.id);
              toast.success("Strategy terminated successfully");
              fetchPlans(plansMeta.page_no);
              setTimeout(() => { setDeleteModalOpen(false); setDeleteTarget(null); setDeleteLoading(false); }, 800);
            } catch (err) {
              toast.error("Termination failed. Active dependencies detected.");
              setDeleteLoading(false);
            }
          } else {
            setDeleteModalOpen(false);
            setDeleteTarget(null);
          }
        }}
        title={t("strategyTermination")}
        description={t("strategyTerminationDesc")}
        confirmLabel={t("submit")}
      />
    </GlassCard>
  );
}
