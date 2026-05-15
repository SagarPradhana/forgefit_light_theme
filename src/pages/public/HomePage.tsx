import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Users, Star, ArrowRight, Play, 
  Check, Zap, Flame, Award, Heart, ChevronLeft, ChevronRight
} from "lucide-react";
import { useGymStore } from "../../store/gymStore";
import { useState, useEffect } from "react";

const premiumFeatures = [
  { icon: Trophy, title: "World-Class Equipment", desc: "State-of-the-art fitness gear from premium brands" },
  { icon: Users, title: "Expert Trainers", desc: "Certified professionals to guide your journey" },
  { icon: Heart, title: "Personal Training", desc: "Customized workouts tailored to your goals" },
  { icon: Zap, title: "Energy & Power", desc: "High-intensity programs for maximum results" },
];

function BannerCarousel() {
  const { publicBanners, isLoadingPublicData } = useGymStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = publicBanners?.["common"] || [];
  
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoadingPublicData || banners.length === 0) return null;

  return (
    <div className="relative h-[250px] md:h-[400px] lg:h-[500px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img 
            src={banners[currentIndex]?.file_path} 
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </motion.div>
      </AnimatePresence>
      
      {banners.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AnimatedCounter({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-6xl md:text-7xl font-display font-black text-gradient"
    >
      {value}
    </motion.span>
  );
}

function HeroSection() {
  const { publicAppConfig, isLoadingPublicData } = useGymStore();
  const brandName = isLoadingPublicData ? "" : (publicAppConfig?.brand_name || "FORGE");
  const logoUrl = publicAppConfig?.logo_image_path;
  
  const stats = [
    { number: "500+", label: "Active Members" },
    { number: "50+", label: "Expert Trainers" },
    { number: "100+", label: "Fitness Programs" },
    { number: "15+", label: "Years Experience" },
  ];

  return (
    <section className="hero-premium">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="pattern-dots" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo & Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-4"
            >
              {logoUrl && (
                <img src={logoUrl} alt={brandName} className="h-12 w-auto" />
              )}
              <div className="badge-premium-light">
                <Zap className="w-4 h-4" />
                Premium Fitness
              </div>
            </motion.div>

            {/* Heading */}
            <h1 className="heading-premium-xl">
              <motion.span 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="block"
              >
                BUILD YOUR
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="block"
              >
                PERFECT
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="block text-gradient-premium"
              >
                BODY TODAY
              </motion.span>
            </h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-[var(--text-muted)] max-w-lg leading-relaxed"
            >
              Experience world-class fitness at {brandName}. Join thousands who have transformed their lives with our premium facilities and expert guidance.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/contact">
                <button className="btn-premium-primary">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/pricing">
                <button className="btn-premium-secondary">
                  <Play className="w-5 h-5" />
                  View Plans
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[var(--border-accent)]"
            >
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <AnimatedCounter value={stat.number} />
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] max-w-lg mx-auto">
              <div className="absolute inset-10 bg-gradient-to-r from-[var(--accent-orange)]/20 to-[var(--accent-gold)]/15 rounded-full blur-3xl" />
              
              <div className="relative rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-hover)]">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                  alt="Fitness"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-6 -left-6 floating-card-premium"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-orange)]/10 to-[var(--accent-gold)]/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[var(--accent-orange)]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">500+</p>
                  <p className="text-sm text-[var(--text-muted)]">Calories Burned</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -top-4 -right-4 floating-card-premium"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/10 to-[var(--accent-orange)]/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[var(--accent-gold)]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">#1 Rated</p>
                  <p className="text-sm text-[var(--text-muted)]">In The City</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="scroll-indicator-light"
      >
        <div className="mouse">
          <div className="dot" />
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="section-premium section-premium-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="badge-premium-light mb-4 inline-flex">
            <Star className="w-4 h-4" />
            Why Choose Us
          </div>
          <h2 className="heading-premium-lg mt-4">
            PREMIUM <span className="text-gradient-premium">FACILITIES</span>
          </h2>
          <p className="text-[var(--text-muted)] mt-4 max-w-2xl mx-auto">
            Experience world-class amenities designed to elevate your fitness journey to unprecedented heights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="feature-card-light"
            >
              <div className="icon-wrap">
                <feature.icon className="w-7 h-7 text-[var(--accent-orange)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { publicSubscriptionPlans, isLoadingPublicData } = useGymStore();
  
  const plans = isLoadingPublicData ? [] : (publicSubscriptionPlans?.length > 0 
    ? publicSubscriptionPlans.map((plan, idx) => ({
        name: plan.name,
        price: plan.price?.toString() || "0",
        period: "/month",
        features: plan.features || [],
        popular: idx === 1,
      }))
    : [
        { name: "Basic", price: "999", period: "/month", features: ["Gym Access", "Basic Equipment", "Locker Room"], popular: false },
        { name: "Pro", price: "1,999", period: "/month", features: ["All Basic Features", "Personal Trainer", "Group Classes"], popular: true },
        { name: "Elite", price: "3,499", period: "/month", features: ["All Pro Features", "VIP Lounge", "Private Trainer"], popular: false },
      ]);

  return (
    <section className="section-premium section-premium-light">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="badge-premium-light mb-4 inline-flex">
            <Star className="w-4 h-4" />
            Membership Plans
          </div>
          <h2 className="heading-premium-lg mt-4">
            CHOOSE YOUR <span className="text-gradient-premium">PLAN</span>
          </h2>
          <p className="text-[var(--text-muted)] mt-4 max-w-2xl mx-auto">
            Flexible plans designed to fit your lifestyle and fitness goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`pricing-card-light ${plan.popular ? 'featured' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-black text-[var(--text-primary)]">₹{plan.price}</span>
                <span className="text-[var(--text-muted)] ml-2">{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <Check className="w-5 h-5 text-[var(--accent-orange)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full ${plan.popular ? 'btn-premium-primary justify-center' : 'btn-premium-secondary justify-center'}`}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { publicTestimonials, isLoadingPublicData } = useGymStore();
  
  const testimonials = isLoadingPublicData ? [] : (publicTestimonials?.length > 0 
    ? publicTestimonials.map((t) => ({
        name: t.name,
        role: "Member",
        text: t.note || t.content || "",
        image: t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`,
        rating: 5,
      }))
    : [
        { name: "Sarah Mitchell", role: "Fitness Enthusiast", text: "This gym changed my life. The trainers are incredible!", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", rating: 5 },
        { name: "James Rodriguez", role: "Professional Athlete", text: "Best training facility in the city.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", rating: 5 },
        { name: "Emily Chen", role: "Model", text: "The personalized training helped me achieve my goals.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", rating: 5 },
      ]);

  if (testimonials.length === 0) return null;

  return (
    <section className="section-premium section-premium-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="badge-premium-light mb-4 inline-flex">
            <Star className="w-4 h-4" />
            Testimonials
          </div>
          <h2 className="heading-premium-lg mt-4">
            WHAT MEMBERS <span className="text-gradient-premium">SAY</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="testimonial-card-light"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                ))}
              </div>
              <p className="text-[var(--text-secondary)] mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <img src={testimonial.image} alt={testimonial.name} className="avatar" />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{testimonial.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="cta-premium">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-premium-xl mb-6">
            READY TO <span className="text-gradient-premium">TRANSFORM</span>?
          </h2>
          <p className="text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of members who have already started their fitness journey. Your transformation begins today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <button className="btn-premium-primary">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/pricing">
              <button className="btn-premium-secondary">
                View Membership Plans
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <PublicLayout>
      <div>
        <BannerCarousel />
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </PublicLayout>
  );
}