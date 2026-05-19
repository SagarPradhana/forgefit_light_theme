import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ShoppingBag,
  Zap,
  CheckCircle2,
  MapPin,
  CalendarFold,
  Info,
  Package,
  Minus,
  Plus,
} from "lucide-react";
import {
  GlassCard,
  CommonButton,
  Modal,
  GlowButton,
} from "../components/ui/primitives";
import { toast } from "../store/toastStore";
import { useAuthStore } from "../store/authStore";
import { appInquiryService } from "../services/appInquiryService";
import type { AppProductResponse } from "../services/appProductService";

interface ProductCardProps {
  product: AppProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.id);
  const isSupplement = product.category?.toLowerCase().includes("supplement");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [orderOpen, setOrderOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOrderInquiry = async () => {
    if (!userId) {
      toast.error("Please log in to place an order inquiry.");
      return;
    }
    setSubmitting(true);
    try {
      await appInquiryService.createProductOrder({
        user_id: userId,
        product_id: product.id,
        quantity,
        description: description || `Order inquiry for ${product.name}`,
      });
      setOrderOpen(false);
      setQuantity(1);
      setDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="group relative"
      >
        <GlassCard className="h-full p-6 flex flex-col gap-5 overflow-hidden border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl">
          {/* 🔥 TOP BADGE */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
            {product.stock_count > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={10} />
                <span className="text-[9px] font-black uppercase tracking-widest">In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                <Package size={10} />
                <span className="text-[9px] font-black uppercase tracking-widest">Out of Stock</span>
              </div>
            )}
          </div>

          {/* 🖼 VISUAL HERO */}
          <div className="relative h-44 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 flex items-center justify-center overflow-hidden group-hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_70%)]" />

            {product.image_url ? (
              <img
                src={product.image_url.startsWith("http") ? product.image_url : `${BASE_URL}${product.image_url}`}
                alt={product.name}
                className="relative z-10 h-full w-full object-cover rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}

            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className={`relative z-10 ${product.image_url ? "hidden" : ""}`}
            >
              {isSupplement ? (
                <Zap size={48} className="text-indigo-400/40 drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]" />
              ) : (
                <ShoppingBag size={48} className="text-orange-400/40 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]" />
              )}
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950/80 to-transparent">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={10} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Locally available at Gym</span>
              </div>
            </div>
          </div>

          {/* 🏷 IDENTIFIER */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border transition-colors ${isSupplement ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-orange-500/10 text-orange-300 border-orange-500/20"
                }`}>
                {product.category}
              </span>
              <div className="h-1 w-1 rounded-full bg-slate-700" />
              {product.unit && (
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{product.unit}</span>
              )}
            </div>

            <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight group-hover:text-indigo-300 transition-colors">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{product.description}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</span>
                <p className="text-2xl font-black text-white italic tracking-tighter">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stock</span>
                  <p className="text-sm font-black text-emerald-400">{product.stock_count}</p>
                </div>
                <button
                  onClick={() => setOrderOpen(true)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <Info size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 📅 BOOKING ZONE */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <p className="text-[9px] font-bold text-slate-500 italic text-center px-2 leading-relaxed">
              Note: Online payments are disabled. Please place an order inquiry and complete the transaction at our local gym counter.
            </p>
            <CommonButton
              onClick={() => setOrderOpen(true)}
              disabled={product.stock_count <= 0}
              className={`w-full h-12 flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/10 active:scale-95 ${product.stock_count <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <CalendarFold size={16} />
              Order Inquiry
            </CommonButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Order Inquiry Modal */}
      <Modal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title={`Order Inquiry — ${product.name}`}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center">
              {isSupplement ? <Zap size={20} className="text-indigo-500" /> : <ShoppingBag size={20} className="text-orange-500" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">{product.category} • ₹{Number(product.price).toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                <Minus size={16} />
              </button>
              <span className="text-xl font-semibold text-gray-900 w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock_count, q + 1))}
                className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all resize-none"
              placeholder="Any special requests..." />
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Estimated Total</span>
            <span className="text-lg font-bold text-gray-900">₹{(product.price * quantity).toLocaleString("en-IN")}</span>
          </div>

          <GlowButton className="w-full h-12 rounded-lg text-sm font-semibold" onClick={handleOrderInquiry} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Order Inquiry"}
          </GlowButton>
          <p className="text-xs text-center text-gray-400">
            This sends an inquiry to the gym admin. You'll complete the payment at the counter.
          </p>
        </div>
      </Modal>
    </>
  );
}
