import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useGymStore } from "./store/gymStore";
import DashboardLayout from "./pages/DashboardLayout";
import { NotFound404, LoadingSpinner } from "./components/ui/primitives";
import { ToastContainer } from "./components/ui/ToastContainer";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = lazy(() =>
  import("./pages/public/HomePage").then((m) => ({ default: m.HomePage })),
);
const AboutPage = lazy(() =>
  import("./pages/public/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ServicesPage = lazy(() =>
  import("./pages/public/ServicesPage").then((m) => ({
    default: m.ServicesPage,
  })),
);
const PricingPage = lazy(() =>
  import("./pages/public/PricingPage").then((m) => ({
    default: m.PricingPage,
  })),
);
const TestimonialsPage = lazy(() =>
  import("./pages/public/TestimonialsPage").then((m) => ({
    default: m.TestimonialsPage,
  })),
);
const ContactPage = lazy(() =>
  import("./pages/public/ContactPage").then((m) => ({
    default: m.ContactPage,
  })),
);
const SignInPage = lazy(() =>
  import("./pages/public/SignInPage").then((m) => ({ default: m.SignInPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/public/ForgotPassword").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const AdminPortalPages = lazy(() =>
  import("./pages/admin/AdminPortalPages").then((m) => ({
    default: m.AdminPortalPages,
  })),
);

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserManagement = lazy(() => import("./components/admin/UserManagement").then(m => ({ default: m.UserManagement })));
const AttendanceManagement = lazy(() => import("./components/admin/AttendanceManagement").then(m => ({ default: m.AttendanceManagement })));
const RevenueOps = lazy(() => import("./components/admin/RevenueOps").then(m => ({ default: m.RevenueOps })));
const PlansManagement = lazy(() => import("./components/admin/PlansManagement").then(m => ({ default: m.PlansManagement })));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions").then(m => ({ default: m.AdminSubscriptions })));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts").then(m => ({ default: m.AdminProducts })));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments").then(m => ({ default: m.AdminPayments })));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile").then(m => ({ default: m.AdminProfile })));
const AdminSettings = lazy(() => import("./components/admin/settings/AdminSettings").then(m => ({ default: m.AdminSettings })));
const InquiryCenter = lazy(() => import("./components/admin/InquiryCenter").then(m => ({ default: m.InquiryCenter })));
const ChangePassword = lazy(() => import("./components/admin/ChangePassword").then(m => ({ default: m.ChangePassword })));

const UserPortalPages = lazy(() =>
  import("./pages/user/UserPortalPages").then((m) => ({
    default: m.UserPortalPages,
  })),
);

const TrainerPortalPages = lazy(() =>
  import("./pages/trainer/TrainerPortalPages").then((m) => ({
    default: m.TrainerPortalPages,
  })),
);

const TrainerDashboard = lazy(() => import("./pages/trainer/TrainerDashboard").then(m => ({ default: m.TrainerDashboard })));
const TrainerAttendance = lazy(() => import("./components/trainer/TrainerAttendance").then(m => ({ default: m.TrainerAttendance })));
const TrainerProfile = lazy(() => import("./pages/trainer/TrainerProfile").then(m => ({ default: m.TrainerProfile })));
const TrainerWorkouts = lazy(() => import("./pages/trainer/TrainerWorkouts").then(m => ({ default: m.TrainerWorkouts })));
const TrainerDiets = lazy(() => import("./pages/trainer/TrainerDiets").then(m => ({ default: m.TrainerDiets })));

const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const UserProfile = lazy(() => import("./pages/user/UserProfile").then(m => ({ default: m.UserProfile })));
const UserSubscription = lazy(() => import("./pages/user/UserSubscription").then(m => ({ default: m.UserSubscription })));
const UserAttendance = lazy(() => import("./pages/user/UserAttendance").then(m => ({ default: m.UserAttendance })));
const UserPayments = lazy(() => import("./pages/user/UserPayments").then(m => ({ default: m.UserPayments })));
const UserProducts = lazy(() => import("./pages/user/UserProducts").then(m => ({ default: m.UserProducts })));
const SettingsPanel = lazy(() => import("./pages/SettingPanel").then(m => ({ default: m.SettingsPanel })));

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, token } = useAuthStore();
  if (isAuthenticated && isTokenValid(token)) {
    const dest =
      role === "admin" ? "/admin/dashboard" :
        role === "trainer" ? "/trainer/dashboard" :
          "/user/dashboard";
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}

function ProtectedRole({
  expectedRole,
  children,
}: {
  expectedRole: "admin" | "user" | "trainer";
  children: React.ReactNode;
}) {
  const { role, isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated || !isTokenValid(token) || role !== expectedRole)
    return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-cream-50 via-pearl-50 to-cream-100"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold-400 to-gold-500 shadow-gold-lg animate-pulse"></div>
        <div className="absolute inset-2 rounded-2xl bg-white flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-violet"></div>
        </div>
      </div>
      <div className="text-sm font-semibold tracking-[0.2em] text-slate-500 uppercase animate-pulse">
        Loading...
      </div>
    </motion.div>
  </motion.div>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { updateAppConfig, fetchPublicData, publicAppConfig } = useGymStore();
  const location = useLocation();
  const fetchedStatus = useRef({ config: false, full: false });

  useEffect(() => {
    const isPublicAuthRoute = ["/signin", "/forgot-password"].includes(location.pathname) || location.pathname.startsWith("/auth");
    const isDashboardRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/user") || location.pathname.startsWith("/trainer");
    const fetchConfigOnly = isPublicAuthRoute || isDashboardRoute;

    if (fetchConfigOnly && (fetchedStatus.current.config || fetchedStatus.current.full)) return;
    if (!fetchConfigOnly && fetchedStatus.current.full) return;

    fetchPublicData(fetchConfigOnly).then(() => {
      if (fetchConfigOnly) {
        fetchedStatus.current.config = true;
      } else {
        fetchedStatus.current.full = true;
      }
    });
  }, [location.pathname, fetchPublicData]);

  useEffect(() => {
    if (publicAppConfig) {
      updateAppConfig({
        name: publicAppConfig.brand_name,
        logo: publicAppConfig.logo_image_path,
        description: publicAppConfig.description,
        contactEmail: publicAppConfig.email,
        contactPhone: publicAppConfig.phone,
        timezone: publicAppConfig.timezone,
        currency: publicAppConfig.currency,
        language: publicAppConfig.language,
      });

      if (publicAppConfig.language) {
        import("./i18n").then(({ default: i18n }) => {
          i18n.changeLanguage(publicAppConfig.language);
        });
      }
    }
  }, [publicAppConfig]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cream-50 via-pearl-50 to-cream-100 overflow-x-hidden">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      <ToastContainer />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<AuthRedirect><HomePage /></AuthRedirect>} />
          <Route path="/about" element={<AuthRedirect><AboutPage /></AuthRedirect>} />
          <Route path="/services" element={<AuthRedirect><ServicesPage /></AuthRedirect>} />
          <Route path="/pricing" element={<AuthRedirect><PricingPage /></AuthRedirect>} />
          <Route path="/testimonials" element={<AuthRedirect><TestimonialsPage /></AuthRedirect>} />
          <Route path="/contact" element={<AuthRedirect><ContactPage /></AuthRedirect>} />
          <Route path="/signin" element={<AuthRedirect><SignInPage /></AuthRedirect>} />
          <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
          <Route path="/auth" element={<Navigate to="/signin" replace />} />
          <Route path="/admin" element={<ProtectedRole expectedRole="admin"><DashboardLayout><AdminPortalPages /></DashboardLayout></ProtectedRole>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="revenueops" element={<RevenueOps />} />
            <Route path="plans" element={<PlansManagement />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="inquiries" element={<InquiryCenter />} />
            <Route path="notifications" element={<InquiryCenter />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route path="/trainer" element={<ProtectedRole expectedRole="trainer"><DashboardLayout><TrainerPortalPages /></DashboardLayout></ProtectedRole>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TrainerDashboard />} />
            <Route path="users" element={<UserManagement portalType="trainer" />} />
            <Route path="attendance" element={<TrainerAttendance />} />
            <Route path="profile" element={<TrainerProfile />} />
            <Route path="workouts" element={<TrainerWorkouts />} />
            <Route path="diets" element={<TrainerDiets />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route path="/user" element={<ProtectedRole expectedRole="user"><DashboardLayout><UserPortalPages /></DashboardLayout></ProtectedRole>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="subscription" element={<UserSubscription />} />
            <Route path="attendance" element={<UserAttendance />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="products" element={<UserProducts />} />
            <Route path="settings" element={<SettingsPanel />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </Suspense>
    </div>
  );
}