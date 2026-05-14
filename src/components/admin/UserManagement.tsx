import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GlassCard, SectionTitle } from "../../components/ui/primitives";
import { Search, Grid, List, Plus, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useGet, useMutation } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../utils/url";
import { api } from "../../utils/httputils";
import { toast } from "../../store/toastStore";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { adminAppConfigService } from "../../services/adminAppConfigService";
import { isValidEmail, isValidPhone, isValidName } from "../../utils/formUtils";

// Sub-components
import { UserModal } from "./users/UserModal";
import { UserListView } from "./users/UserListView";
import { DocumentModal } from "./users/DocumentModal";
import { AttendanceModal } from "./users/AttendanceModal";
import { DeleteUserModal } from "./users/DeleteUserModal";
import { SubscriptionModal } from "./users/SubscriptionModal";
import { PasswordResetModal } from "./users/PasswordResetModal";
import { IdCardModal } from "../common/IdCardModal";
import { UserCreationSuccessModal } from "./users/UserCreationSuccessModal";

// Types
import type { ViewType, ModalStep, UserFormData } from "./users/types";

export function UserManagement({ portalType = "admin" }: { portalType?: "admin" | "trainer" }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Read initial role from URL query param (e.g. ?role=admin from dashboard redirect)
  const initialRole = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("role") || "";
  }, [location.search]);

  const initialPlanStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("plan_status") || "";
  }, [location.search]);

  const authRole = useAuthStore((s) => s.role);
  const isTrainer = authRole === "trainer";

  // --- States ---
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>("role");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  // Admin config for WhatsApp messages
  const publicAppConfig = useGymStore((s) => s.publicAppConfig);
  const brandName = publicAppConfig?.brand_name || "Forgefit Gym";
  const [adminConfig, setAdminConfig] = useState<{
    website_url?: string;
    whatsapp?: string;
    phone?: string;
    expiry_reminder_days?: number;
  }>({});

  useEffect(() => {
    const fetchAdminConfig = async () => {
      try {
        const res = await adminAppConfigService.getConfig();
        const cfg = res?.data?.[0] || res;
        if (cfg?.expiry_reminder_days !== undefined) {
          setAdminConfig({
            website_url: cfg.website_url || "",
            whatsapp: cfg.whatsapp || "",
            phone: cfg.phone || "",
            expiry_reminder_days: cfg.expiry_reminder_days || 7,
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin config:", err);
      }
    };
    fetchAdminConfig();
  }, []);

  // Role filter state — initialized from URL param
  const [roleFilter, setRoleFilter] = useState<string>(initialRole);
  const [planStatusFilter, setPlanStatusFilter] = useState<string>(initialPlanStatus);
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");

  // Sync filters if URL params change (e.g. navigating back from dashboard)
  useEffect(() => {
    setRoleFilter(initialRole);
    setPlanStatusFilter(initialPlanStatus);
    setPage(1);
  }, [initialRole, initialPlanStatus]);

  // Document Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedUserForDocs, setSelectedUserForDocs] = useState<any>(null);
  const [docUploading, setDocUploading] = useState<string | null>(null);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedUserForAttendance, setSelectedUserForAttendance] = useState<any>(null);

  // Subscription Modal State
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [selectedUserForSubscription, setSelectedUserForSubscription] = useState<any>(null);

  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<any>(null);

  // User Created Success Modal State
  const [showUserCreatedModal, setShowUserCreatedModal] = useState(false);
  const [userCreatedData, setUserCreatedData] = useState<{
    username?: string;
    role: string;
    email?: string;
    mobile: string;
    name: string;
    joining_date: number;
    password: string;
  } | null>(null);

  // ID Card Modal State
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [selectedUserForCard, setSelectedUserForCard] = useState<any>(null);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Temp storage for user creation data for popup
  const tempPasswordRef = useRef<string>("");

  // --- API Fetching ---
  const usersApiUrl = useMemo(() => {
    const currentPage = Number(page) || 1;
    const currentCount = Number(perPage) || 10;
    const params = new URLSearchParams({
      offset: String((currentPage - 1) * currentCount),
      count: String(currentCount),
    });
    if (debouncedSearch.trim()) {
      params.append("search", debouncedSearch.trim());
      params.append("member_id", debouncedSearch.trim()); // The user specified member_id is a parameter in GET
    }
    if (roleFilter && !isTrainer) {
      params.append("role", roleFilter);
    }
    if (planStatusFilter) {
      params.append("plan_status", planStatusFilter);
    }
    if (isActiveFilter) {
      params.append("is_active", isActiveFilter);
    }
    return isTrainer ? `${API_ENDPOINTS.ADMIN.TRAINER_USERS}?${params.toString()}` : `${API_ENDPOINTS.ADMIN.USERS}?${params.toString()}`;
  }, [page, perPage, debouncedSearch, roleFilter, planStatusFilter, isActiveFilter, isTrainer]);

  const { loading: usersLoading, refetch: refetchUsers } = useGet(
    usersApiUrl,
    {
      onSuccess: (res) => {
        const newUsers = res.data || [];
        if (page === 1) setAllUsers(newUsers);
        else setAllUsers((prev) => [...prev, ...newUsers]);
        setHasMore(newUsers.length === perPage);
      },
    }
  );

  const { data: rolesData } = useGet(!isTrainer ? API_ENDPOINTS.ADMIN.ROLES : null, { useCache: true });
  const roles = useMemo<string[]>(() => {
    if (!rolesData?.data) return ["admin", "trainer", "user"];
    // Extract unique roles from data
    const unique = Array.from(new Set(rolesData.data.map((r: any) => r.role))) as string[];
    return unique.length > 0 ? unique : ["admin", "trainer", "user"];
  }, [rolesData]);

  const { data: plansData } = useGet(!isTrainer ? API_ENDPOINTS.ADMIN.PLANS : null, { useCache: true });
  const plans = plansData?.data || [];
  const { data: trainersData } = useGet(!isTrainer ? API_ENDPOINTS.ADMIN.TRAINER_LIST : null, { useCache: true });
  const trainers = trainersData?.data || [];

  // --- Mutations ---
  const { mutate: createUser, loading: creating } = useMutation("post", {
    onSuccess: (res) => {
      setModalOpen(false);
      setPage(1);
      toast.success("User created successfully");

      const responseUser = Array.isArray(res?.data) ? res.data[0] : (res?.data || res);

      // Show success popup with user details
      const userData = {
        username: responseUser?.username || responseUser?.user_name || responseUser?.member_id || "",
        role: formData.role,
        email: responseUser?.email || formData.email || "",
        mobile: responseUser?.mobile || responseUser?.phone || formData.mobile,
        name: responseUser?.name || formData.name,
        joining_date: responseUser?.joining_date || formData.joining_date,
        password: tempPasswordRef.current || formData.password || "Password@123"
      };
      setUserCreatedData(userData);
      setShowUserCreatedModal(true);

      refetchUsers();
    }
  });


  const { mutate: editUser, loading: editing } = useMutation("patch", {
    onSuccess: () => {
      setModalOpen(false);
      setPage(1);
      toast.success("User updated successfully");
      refetchUsers();
    }
  });



  const { mutate: patchStatus, loading: statusUpdating } = useMutation("patch", {
    onSuccess: () => {
      toast.success("User status updated successfully");
      setLoadingStatusId(null);
      refetchUsers();
    },
    onError: () => setLoadingStatusId(null)
  });

  const { mutate: deleteUserRecord, loading: deletingRecord } = useMutation("delete", {
    onSuccess: () => {
      toast.success("User deleted successfully from records");
      setDeleteModalOpen(false);
      setLoadingDeleteId(null);
      refetchUsers();
    },
    onError: () => setLoadingDeleteId(null)
  });

  const { mutate: deleteDocument, loading: docDeleting } = useMutation("delete", {
    onSuccess: () => {
      toast.success("Document permanently removed");
      refetchUsers();
    }
  });

  // --- Logic ---
  const [formData, setFormData] = useState<UserFormData>({
    // username: "",
    mobile: "",
    name: "",
    email: "",
    address: "",
    role: "user",
    joining_date: Math.floor(Date.now() / 1000),
    metadata: {
      height: 0,
      weight: 0,
      dob: Math.floor(Date.now() / 1000),
      gender: "male",
      language: "en",
      theme: "dark",
      fitness_goal: "fitness",
      medical_conditions: "",
      workout_time: "morning",
      emergency_contact: "",
    },
    trainer_id: "",
    subscription_id: "",
    duration_in_months: 1,
    amount: 0,
    profilePhoto: ""
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setAllUsers([]);
  }, [roleFilter, planStatusFilter, isActiveFilter]);

  // Sync selected user when data refreshes
  useEffect(() => {
    if (selectedUserForDocs) {
      const updatedUser = allUsers.find((u) => u.id === selectedUserForDocs.id);
      if (updatedUser) setSelectedUserForDocs(updatedUser);
    }
  }, [allUsers, selectedUserForDocs?.id]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserElementRef = useCallback((node: HTMLDivElement) => {
    if (usersLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && viewType === "grid") {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [usersLoading, hasMore, viewType]);

  const handleAddNew = () => {
    setFormData({
      // username: "",
      mobile: "",
      name: "",
      email: "",
      address: "",
      role: "user",
      joining_date: Math.floor(Date.now() / 1000),
      metadata: {
        height: 0,
        weight: 0,
        dob: Math.floor(Date.now() / 1000),
        gender: "male",
        language: "en",
        theme: "dark",
        fitness_goal: "fitness",
        medical_conditions: "",
        workout_time: "morning",
        emergency_contact: "",
      },
      trainer_id: "",
      subscription_id: "",
      duration_in_months: 1,
      amount: 0,
      profilePhoto: ""
    });
    setEditingUserId(null);
    setModalStep("role");
    setModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setFormData({
      // username: user.username || "",
      mobile: user.mobile || user.phone || "",
      name: user.name,
      email: user.email,
      address: user.address || "",
      role: user.role || "user",
      joining_date: user.joining_date || Math.floor(Date.now() / 1000),
      metadata: {
        height: user.metadata?.height || 0,
        weight: user.metadata?.weight || 0,
        dob: user.metadata?.dob || Math.floor(Date.now() / 1000),
        gender: user.metadata?.gender || "male",
        language: user.metadata?.language || "en",
        theme: user.metadata?.theme || "dark",
        fitness_goal: user.metadata?.fitness_goal || "fitness",
        medical_conditions: user.metadata?.medical_conditions || "",
        workout_time: user.metadata?.workout_time || "morning",
        emergency_contact: user.metadata?.emergency_contact || "",
        purchase_id: user.metadata?.purchase_id || user.purchase_id || "",
      },
      trainer_id: user.trainer_id || "",
      subscription_id: user.subscription_id || "",
      duration_in_months: user.duration_in_months || 1,
      amount: user.amount || 0,
      status: user.status || "active",
      start_date: user.start_date || 0,
      end_date: user.end_date || 0,
      profilePhoto: user.profile_image_path || user.metadata?.profile_image_path || "",
      purchase_id: user.purchase_id || user.metadata?.purchase_id || "",
    });
    setEditingUserId(user.id);
    setModalStep("role");
    setModalOpen(true);
    setShowPassword(false);
  };

  const handleNextStep = () => {
    if (modalStep === "role") {
      if (!isValidName(formData.name)) {
        toast.error("Full Name must be between 3 and 30 characters");
        return;
      }
      if (!isValidPhone(formData.mobile)) {
        toast.error("Mobile number must be between 7 and 15 digits");
        return;
      }
      if (formData.email && !isValidEmail(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (!editingUserId && (!formData.password || formData.password.length < 6)) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      setModalStep("details");
      return;
    }
    if (modalStep === "details") {
      if (!formData.address) {
        toast.error("Address is required");
        return;
      }
      setModalStep("metadata");
      return;
    }
    if (modalStep === "metadata") {
      setModalStep("membership");
      return;
    }
  };

  const handleBackStep = () => {
    const steps: ModalStep[] = ["role", "details", "metadata", "membership"];
    const currentIndex = steps.indexOf(modalStep);
    if (currentIndex > 0) setModalStep(steps[currentIndex - 1]);
  };

  const handleSaveUser = () => {
    // Strip UI-only fields before sending
    const { profilePhoto, ...rawPayload } = formData;

    const trainer_id = rawPayload.trainer_id?.trim() === "" ? null : rawPayload.trainer_id;
    const subscription_id = rawPayload.subscription_id?.trim() === "" ? null : rawPayload.subscription_id;

    // Build metadata strictly matching API schema (no extra fields)
    const metadata = {
      height: rawPayload.metadata.height,
      weight: rawPayload.metadata.weight,
      dob: rawPayload.metadata.dob,
      gender: rawPayload.metadata.gender,
      language: rawPayload.metadata.language,
      theme: rawPayload.metadata.theme,
      fitness_goal: rawPayload.metadata.fitness_goal,
      medical_conditions: rawPayload.metadata.medical_conditions,
      workout_time: rawPayload.metadata.workout_time,
      emergency_contact: rawPayload.metadata.emergency_contact,
      purchase_id: rawPayload.metadata.purchase_id,
    };

    if (editingUserId) {
      // Edit payload — includes subscription fields, no password
      const editPayload = {
        mobile: rawPayload.mobile,
        name: rawPayload.name,
        email: rawPayload.email,
        address: rawPayload.address,
        role: rawPayload.role,
        metadata,
        joining_date: rawPayload.joining_date,
        trainer_id,
        subscription_id,
        duration_in_months: rawPayload.duration_in_months,
        amount: rawPayload.amount,
        status: rawPayload.status,
        start_date: rawPayload.start_date,
        purchase_id: rawPayload.purchase_id || rawPayload.metadata.purchase_id,
        end_date: rawPayload.end_date,
      };
      editUser(API_ENDPOINTS.ADMIN.USER_EDIT(editingUserId), editPayload);
    } else {
      // Store password temporarily for success popup
      tempPasswordRef.current = rawPayload.password || "Password@123";

      // Create payload — includes password, no subscription fields
      const createPayload = {
        mobile: rawPayload.mobile,
        name: rawPayload.name,
        email: rawPayload.email,
        password: rawPayload.password || "Password@123",
        address: rawPayload.address,
        role: rawPayload.role,
        metadata,
        joining_date: rawPayload.joining_date,
        trainer_id,
      };
      createUser(API_ENDPOINTS.ADMIN.USER_CREATE, createPayload);
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    setLoadingStatusId(userId);
    patchStatus(API_ENDPOINTS.ADMIN.USER_STATUS(userId), { status: !currentStatus });
  };

  const handleDocDelete = (docType: string, docUrl: string) => {
    if (!selectedUserForDocs) return;
    const url = `${API_ENDPOINTS.ADMIN.USER_DOC_DELETE(selectedUserForDocs.id)}?doc_type=${docType}&doc_full_url=${encodeURIComponent(docUrl)}`;
    deleteDocument(url);
  };

  const handleOpenIdCard = async (user: any) => {
    try {
      const res = await api.get(API_ENDPOINTS.USER.MY_DETAILS(user.id));
      // res is the direct JSON object containing user details and latest_subscription_details
      const fullUserDetails = { ...user, ...res };
      setSelectedUserForCard(fullUserDetails);
      setIdCardOpen(true);
    } catch (err) {
      toast.error("Failed to fetch user details for ID Card.");
    }
  };

  const openWhatsAppChat = (user: any) => {
    const phone = user.mobile || user.phone;
    if (!phone) {
      toast.error("User does not have a mobile number provided");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");

    const { plan_status, remaining_days = 0 } = user;
    const expiryDays = adminConfig.expiry_reminder_days || 7;
    const websiteUrl = adminConfig.website_url?.replace(/\/$/, "") || "";
    const contactPhone = adminConfig.whatsapp || adminConfig.phone || "";
    const subscriptionUrl = websiteUrl ? `${websiteUrl}/user/subscription` : "";
    const whatsappLink = contactPhone ? `https://wa.me/${contactPhone.replace(/\D/g, "")}` : "";

    const renewalLinks = (subscriptionUrl || whatsappLink)
      ? `\n\n${subscriptionUrl ? `👉 Subscribe: ${subscriptionUrl}\n` : ""}${whatsappLink ? `👉 Contact: ${whatsappLink}` : ""}`
      : "";

    let message;

    if (plan_status === "active") {
      if (remaining_days < expiryDays) {
        message = `Hi ${user.name}! 👋\n\nYour *${brandName}* membership is *ACTIVE* but expires in *${remaining_days} days*.\n\nRenew or upgrade your plan now to keep your fitness journey going! 💪${renewalLinks}\n\n- ${brandName} Team`;
      } else {
        message = `Hi ${user.name}! 👋\n\nGreat news from *${brandName}*! Your membership is *ACTIVE* with *${remaining_days} days* remaining.\n\nKeep up the great work and see you at the gym! 💪\n\n- ${brandName} Team`;
      }
    } else if (plan_status === "expired") {
      message = `Hi ${user.name}! 👋\n\nYour *${brandName}* membership has *EXPIRED*.\n\nDon't miss out on your fitness journey! Renew today and continue working towards your goals. 💪${renewalLinks}\n\n- ${brandName} Team`;
    } else {
      message = `Hi ${user.name}! 👋\n\nYou don't have an active subscription at *${brandName}* yet.\n\nStart your fitness journey with us today! Contact us for membership details. 💪${renewalLinks}\n\n- ${brandName} Team`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleDeleteUser = (userId: string) => {
    setLoadingDeleteId(userId);
    deleteUserRecord(API_ENDPOINTS.ADMIN.USER_DELETE(userId));
    setDeleteTarget(null);
  };

  const getModalTitle = () => {
    if (modalStep === "metadata") return t("healthVitals");
    if (modalStep === "membership") return t("planSelection");
    if (modalStep === "details") return t("assignmentDetails");
    return editingUserId ? t("updateProfile") : t("createNewUser");
  };

  const getStepNumber = () => {
    const stepMap: Record<ModalStep, string> = {
      role: "1", details: "2", metadata: "3", membership: "4"
    };
    return `${stepMap[modalStep]}/4`;
  };

  const isFinalStep = modalStep === "membership";
  const isAnyLoading = creating || editing || statusUpdating || deletingRecord || docDeleting || !!docUploading;

  return (
    <GlassCard>
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <SectionTitle
          title={t("users")}
          subtitle={t("manageGymMembers")}
        />
        {roleFilter && (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${roleFilter === "admin" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" :
            roleFilter === "trainer" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
              "bg-sky-500/20 text-sky-300 border-sky-500/30"
            }`}>
            {roleFilter === "admin" ? t("admins") : roleFilter === "trainer" ? t("trainers") : t("users")}
            <button
              onClick={() => setRoleFilter("")}
              className="ml-1.5 opacity-60 hover:opacity-100 transition-opacity font-black"
              title={t("clearFilter")}
            >✕</button>
          </span>
        )}
        {planStatusFilter && (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${planStatusFilter === "active" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
            {planStatusFilter === "active" ? t("activePlans") : t("expiredPlans")}
            <button
              onClick={() => setPlanStatusFilter("")}
              className="ml-1.5 opacity-60 hover:opacity-100 transition-opacity font-black"
              title={t("clearFilter")}
            >✕</button>
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
          <button
            onClick={() => setViewType("grid")}
            className={`p-2 rounded transition ${viewType === "grid" ? "bg-indigo-500/30 text-indigo-300" : "text-slate-400 hover:text-white"}`}
            title={t("gridView")}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewType("list")}
            className={`p-2 rounded transition ${viewType === "list" ? "bg-indigo-500/30 text-indigo-300" : "text-slate-400 hover:text-white"}`}
            title={t("listView")}
          >
            <List size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-6 max-w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t("searchMembers")}</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input
                id="admin-master-user-search-query-field"
                name="admin-master-user-search-query-field"
                type="text"
                autoComplete="new-password"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-none"
              />
            </div>
          </div>
          {!isTrainer && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t("role")}</label>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <select
                  id="admin-user-role-filter"
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); }}
                  className="h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition cursor-pointer appearance-none min-w-[140px] [&>option]:bg-slate-900"
                >
                  <option value="">{t("allRoles")}</option>
                  <option value="admin">{t("admins")}</option>
                  <option value="trainer">{t("trainers")}</option>
                  <option value="user">{t("users")}</option>
                </select>
              </div>
            </div>
          )}

          {!isTrainer && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t("planStatus")}</label>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <select
                  id="admin-user-plan-status-filter"
                  value={planStatusFilter}
                  onChange={(e) => { setPlanStatusFilter(e.target.value); }}
                  className="h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition cursor-pointer appearance-none min-w-[140px] [&>option]:bg-slate-900"
                >
                  <option value="">{t("allPlanStatus")}</option>
                  <option value="active">{t("activePlan")}</option>
                  <option value="expired">{t("expiredPlan")}</option>
                  <option value="not_subscribed">{t("notSubscribed")}</option>
                </select>
              </div>
            </div>
          )}

          {!isTrainer && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t("account")}</label>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <select
                  id="admin-user-active-status-filter"
                  value={isActiveFilter}
                  onChange={(e) => { setIsActiveFilter(e.target.value); }}
                  className="h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition cursor-pointer appearance-none min-w-[140px] [&>option]:bg-slate-900"
                >
                  <option value="">{t("allAccounts")}</option>
                  <option value="true">{t("activeOnly")}</option>
                  <option value="false">{t("suspendedOnly")}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {!isTrainer && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-orange-400 hover:from-indigo-600 hover:to-orange-500 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} />
              {t("add")}
            </motion.button>
          </div>
        )}
      </div>

      <UserListView
        viewType={viewType}
        users={allUsers}
        usersLoading={usersLoading}
        statusUpdating={!!loadingStatusId}
        deletingRecord={!!loadingDeleteId}
        loadingStatusId={loadingStatusId}
        loadingDeleteId={loadingDeleteId}
        page={page}
        hasMore={hasMore}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={(id) => { setDeleteTarget(id); setDeleteModalOpen(true); }}
        onToggleStatus={handleToggleStatus}
        onOpenDocs={(user) => { setSelectedUserForDocs(user); setDocModalOpen(true); }}
        onOpenAttendance={(user) => { setSelectedUserForAttendance(user); setAttendanceModalOpen(true); }}
        onOpenSubscription={(user) => { setSelectedUserForSubscription(user); setSubscriptionModalOpen(true); }}
        onResetPassword={(user) => { setSelectedUserForReset(user); setResetModalOpen(true); }}
        onOpenIdCard={handleOpenIdCard}
        onSendWhatsAppReminder={openWhatsAppChat}
        lastUserElementRef={lastUserElementRef}
        portalType={portalType}
      />

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        modalStep={modalStep}
        setModalStep={setModalStep}
        editingUserId={editingUserId}
        onSave={handleSaveUser}
        onNext={handleNextStep}
        onBack={handleBackStep}
        roles={roles}
        plans={plans}
        trainers={trainers}
        isAnyLoading={isAnyLoading}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        getModalTitle={getModalTitle}
        getStepNumber={getStepNumber}
        isFinalStep={isFinalStep}
        portalType={portalType}
      />

      <DocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        selectedUser={selectedUserForDocs}
        docUploading={docUploading}
        setDocUploading={setDocUploading}
        onDeleteDoc={handleDocDelete}
        onRefresh={refetchUsers}
      />

      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        selectedUser={selectedUserForAttendance}
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
        onConfirm={() => deleteTarget && handleDeleteUser(deleteTarget)}
        isProcessing={deletingRecord}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        selectedUser={selectedUserForSubscription}
        plans={plans}
      />

      <PasswordResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        userId={selectedUserForReset?.id}
        userName={selectedUserForReset?.name}
      />

      <UserCreationSuccessModal
        isOpen={showUserCreatedModal}
        onClose={() => setShowUserCreatedModal(false)}
        userData={userCreatedData}
      />

      {selectedUserForCard && (
        <IdCardModal
          isOpen={idCardOpen}
          onClose={() => setIdCardOpen(false)}
          user={selectedUserForCard}
          portalType="admin"
        />
      )}
    </GlassCard>
  );
}
