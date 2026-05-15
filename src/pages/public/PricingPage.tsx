import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { useGymStore } from "../../store/gymStore";
import { Check, Crown, ShieldCheck, Users, Star } from "lucide-react";
import { Counter } from "../../components/common/Counter";
import { getCurrencySymbol } from "../../utils/currency";

export function PricingPage() {
  const { publicSubscriptionPlans, publicAppConfig, plans: fallbackPlans, isLoadingPublicData } = useGymStore();
  const currencySymbol = getCurrencySymbol(publicAppConfig?.currency || "INR");

  // Handle undefined or empty data
  const apiPlans = publicSubscriptionPlans || [];
  const localPlans = fallbackPlans || [];

  const plans = apiPlans.length > 0
    ? apiPlans.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        actualPrice: p.actual_price,
        duration: `${p.duration_in_months} Month${p.duration_in_months > 1 ? "s" : ""}`,
        features: p.description?.includes(",") ? p.description.split(",").map((f) => f.trim()) : [p.description || "Basic access"],
      }))
    : localPlans.map((plan) => ({ ...plan, actualPrice: undefined as number | undefined }));

  // Show loading only if we have NO data at all and are still loading
  if (isLoadingPublicData && apiPlans.length === 0 && localPlans.length === 0) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--border-subtle)] border-t-[var(--accent-orange)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-muted)]">Loading plans...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const allFeatures = Array.from(
    new Set(plans.flatMap((plan) => plan.features || [])),
  );

  return (
    <PublicLayout>
      <div className="overflow-hidden bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-card)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="badge-premium-light inline-flex mb-6"
            >
              <Star className="w-4 h-4" />
              Elite Access Plans
            </motion.div>
            <h1 className="heading-premium-xl mb-6">
              INVEST IN <br /><span className="text-gradient-premium">YOUR EVOLUTION</span>
            </h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
              Transparent pricing designed for every stage of your journey. No hidden fees, just pure performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {plans.map((plan, index) => {
              const isPopular = index === 1;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="relative group"
                >
                  <div className={`pricing-card-light h-full flex flex-col ${isPopular ? 'featured' : ''}`}>
                    {isPopular && <div className="popular-badge">Most Popular</div>}

                    <div className="mb-8">
                      <p className="text-[var(--accent-orange)] text-xs font-black uppercase tracking-[0.2em] mb-4">{plan.name}</p>
                      {typeof plan.actualPrice === "number" && plan.actualPrice > plan.price && (
                        <p className="text-[var(--text-muted)] text-sm line-through mb-2">{currencySymbol}{plan.actualPrice.toLocaleString("en-IN")}</p>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-[var(--text-primary)]">{currencySymbol}<Counter from={0} to={plan.price} /></span>
                        <span className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">/ {plan.duration}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-10 flex-grow">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1 w-5 h-5 rounded-full bg-[var(--accent-orange)]/10 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-[var(--accent-orange)]" />
                          </div>
                          <span className="text-sm text-[var(--text-secondary)] leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link to="/signin">
                      <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 ${isPopular 
                        ? "btn-premium-primary justify-center" 
                        : "btn-premium-secondary justify-center"
                      }`}>
                        Select Plan
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <section className="py-20 border-t border-[var(--border-subtle)]">
            <div className="text-center mb-16">
              <h2 className="heading-premium-lg">FEATURE COMPARISON</h2>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead>
                    <tr className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-card)]">
                      <th className="px-8 py-6">Features</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="px-8 py-6 text-center">{plan.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {allFeatures.map((feature, i) => (
                      <tr key={i} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-[var(--text-secondary)]">{feature}</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="px-8 py-5 text-center">
                            {plan.features.includes(feature) ? (
                              <div className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]">
                                <Check size={14} />
                              </div>
                            ) : (
                              <span className="text-[var(--text-muted)]">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-premium-light text-center">
              <ShieldCheck className="h-8 w-8 text-[var(--accent-orange)] mx-auto mb-4" />
              <h3 className="text-[var(--text-primary)] font-bold mb-2">SECURE BILLING</h3>
              <p className="text-[var(--text-muted)] text-sm">Enterprise-grade encryption for all your transactions and data.</p>
            </div>
            <div className="card-premium-light text-center">
              <Crown className="h-8 w-8 text-[var(--accent-gold)] mx-auto mb-4" />
              <h3 className="text-[var(--text-primary)] font-bold mb-2">ELITE PERKS</h3>
              <p className="text-[var(--text-muted)] text-sm">Members get exclusive access to events and premium recovery gear.</p>
            </div>
            <div className="card-premium-light text-center">
              <Users className="h-8 w-8 text-[var(--accent-orange)] mx-auto mb-4" />
              <h3 className="text-[var(--text-primary)] font-bold mb-2">NO CONTRACTS</h3>
              <p className="text-[var(--text-muted)] text-sm">Flexible memberships that adapt to your evolving lifestyle.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}