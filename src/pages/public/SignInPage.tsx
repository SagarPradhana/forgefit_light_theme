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
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-80px)]">
        {/* LEFT SIDE */}
        <div className="hidden md:flex items-center justify-center p-10 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 max-w-md"
          >
            <div className="badge-premium-light inline-flex">
              <Sparkles className="w-4 h-4" />
              Member Exclusive
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="heading-premium-xl"
            >
              TRANSFORM <br />
              <span className="text-gradient-premium">
                YOUR BODY
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[var(--text-muted)] max-w-md leading-relaxed"
            >
              Join thousands of members achieving their fitness goals with
              personalized training, smart tracking, and expert coaching.
            </motion.p>

            <div className="flex gap-8 pt-4">
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
                  <p className="text-[var(--text-primary)] font-bold text-2xl">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE (FORM) */}
        <div className="flex items-center justify-center p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-10 shadow-[var(--shadow-hover)]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Welcome Back</h2>
                <p className="text-[var(--text-muted)] mb-10">
                  Sign in to continue your journey
                </p>
              </motion.div>

              <form onSubmit={handleFormSubmit} className="space-y-5" noValidate>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <input
                    placeholder="Username / Email / Phone"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                    className={`input-premium ${errors.email ? "!border-red-500" : ""}`}
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
                  <input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                    className={`input-premium pr-12 ${errors.password ? "!border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>
                  )}
                </motion.div>

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
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleRealSignIn}
                    className="btn-premium-primary w-full justify-center h-12 text-sm"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-[var(--text-muted)] text-sm pt-2"
                >
                  Don&apos;t have an account? <Link to="/contact" className="text-[var(--accent-orange)] hover:underline font-bold">Join us</Link>
                </motion.p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
