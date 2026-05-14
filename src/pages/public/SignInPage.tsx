import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CommonButton,
  CommonCard,
  InputField,
} from "../../components/ui/primitives";
import { PublicLayout } from "../../layouts/PublicLayout";
import { useAuthStore } from "../../store/authStore";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import { useMutation } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../utils/url";

export function SignInPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { mutate: performLogin, loading } = useMutation("post", {
    onSuccess: (response) => {
      const { access_token, refresh_token } = response;
      if (!access_token || !refresh_token) return;

      login(access_token, refresh_token);

      const base64Url = access_token.split(".")[1];
      const decoded = JSON.parse(atob(base64Url.replace(/-/g, "+").replace(/_/g, "/")));
      const role = decoded?.role || "user";

      navigate(`/${role}/dashboard`);
    },
  });

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Username, email, or phone is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRealSignIn = async () => {
    if (!validate()) return;

    let login_type: "email" | "phone" | "username" = "username";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    if (emailRegex.test(email)) {
      login_type = "email";
    } else if (phoneRegex.test(email)) {
      login_type = "phone";
    }

    await performLogin(API_ENDPOINTS.AUTH.LOGIN, {
      login_value: email,
      password: password,
      login_type: login_type,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRealSignIn();
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] grid md:grid-cols-2 items-center gap-10 overflow-hidden">
        {/* 🔥 LEFT SIDE (VISUAL SECTION) */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:grid justify-center space-y-6"
        >
          <div className="flex flex-col space-y-2">
            <span className="badge-premium w-fit">
              <Sparkles className="w-4 h-4" />
              Member Exclusive
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-7xl font-display font-bold leading-[0.95] text-charcoal"
          >
            TRANSFORM <br />
            <span className="text-gradient">
              YOUR BODY
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-muted max-w-md"
          >
            Join thousands of members achieving their fitness goals with
            personalized training, smart tracking, and expert coaching.
          </motion.p>

          {/* STATS */}
          <div className="flex gap-8 text-sm pt-4">
            {[
              { label: "Members", value: "500+" },
              { label: "Trainers", value: "50+" },
              { label: "Transformations", value: "1200+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <p className="text-charcoal font-bold text-xl">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 💎 RIGHT SIDE (FORM) */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md mx-auto"
        >
          <CommonCard className="p-8 md:p-12 bg-white border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden group rounded-3xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
              <Sparkles className="text-[var(--accent-orange)] h-16 w-16" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-display font-bold mb-3 text-charcoal">Welcome Back 👋</h2>
              <p className="text-muted mb-10">
                Sign in to continue your journey
              </p>
            </motion.div>

            {/* FORM */}
            <form onSubmit={handleFormSubmit} className="space-y-5" noValidate>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InputField
                  placeholder="Username / Email / Phone"
                  value={email}
                  onChange={(e: any) => { setEmail(e); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                  className={`bg-cream-50 focus:bg-white transition-all border-[var(--border-subtle)] focus:border-[var(--accent-orange)] ${errors.email ? "!border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <InputField
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: any) => { setPassword(e); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                  className={`pr-12 bg-cream-50 focus:bg-white transition-all border-[var(--border-subtle)] focus:border-[var(--accent-orange)] ${errors.password ? "!border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>
                )}
              </motion.div>

              {/* FORGOT */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-end"
              >
                <Link to="/forgot-password">
                  <button type="button" className="text-sm text-[var(--accent-orange)] hover:text-[var(--accent-gold)] transition-colors font-bold uppercase tracking-wider">
                    Forgot password?
                  </button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <CommonButton
                  type="submit"
                  className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] pulse-glow-hover"
                  disabled={loading}
                  onClick={handleRealSignIn}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Sign In"
                  )}
                </CommonButton>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-muted text-sm pt-2"
              >
                Don't have an account? <Link to="/contact" className="text-[var(--accent-orange)] hover:underline font-bold">Join us</Link>
              </motion.p>
            </form>
          </CommonCard>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
