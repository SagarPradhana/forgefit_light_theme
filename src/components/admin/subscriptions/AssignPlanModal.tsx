import { Modal, GlowButton, ButtonLoader, InlineSpinner } from "../../ui/primitives";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignType: "workout" | "diet" | null;
  assignPlanId: string;
  assignUserId: string;
  setAssignUserId: (id: string) => void;
  userSearch: string;
  setUserSearch: (s: string) => void;
  usersDropdown: any[];
  onAssign: () => void;
  assigning?: boolean;
  usersLoading?: boolean;
}

export function AssignPlanModal({
  isOpen,
  onClose,
  assignType,
  assignPlanId,
  assignUserId,
  setAssignUserId,
  userSearch,
  setUserSearch,
  usersDropdown,
  onAssign,
  assigning = false,
  usersLoading = false,
}: AssignPlanModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={assignType === "workout" ? t("assignTrainingProtocol") : t("assignNutritionalStrategy")}
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] transition-all"
            onClick={onClose}
            disabled={assigning}
          >
            {t("cancel")}
          </button>
          <GlowButton onClick={onAssign} disabled={assigning} className="px-8">
            <ButtonLoader label={t("executeAssignment")} loadingLabel={t("loading")} loading={assigning} />
          </GlowButton>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("memberIdentification")}</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder={t("searchMemberPlaceholder")}
              className="w-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] pl-12 pr-4 py-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)]/50 outline-none transition duration-300 text-sm font-bold"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            {usersLoading ? (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <InlineSpinner size={16} className="text-indigo-400" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("deploymentTarget")}</label>
          <select
            className="w-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 text-[var(--text-primary)] focus:border-[var(--accent-orange)]/50 outline-none transition duration-300 text-sm font-bold"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            disabled={usersLoading}
          >
            <option value="" className="bg-white">{t("selectRegistryEntity")}</option>
            {usersDropdown.map((u: any) => (
              <option key={u.id} value={u.id} className="bg-white">{u.name} (@{u.username || u.member_id})</option>
            ))}
          </select>
        </div>

        <div className="bg-[var(--accent-orange)]/5 border border-[var(--accent-orange)]/20 rounded-2xl p-4">
          <p className="text-[10px] text-[var(--accent-orange)] font-bold uppercase tracking-widest leading-relaxed">
            {t("deploymentAlert", { type: assignType })}
          </p>
        </div>
      </div>
    </Modal>
  );
}
