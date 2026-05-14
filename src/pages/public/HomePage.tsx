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
    <div className="relative h-[500px] w-full overflow-hidden">
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
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-white via-ivory to-cream overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full glow-blob-light glow-orange-light animate-float" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full glow-blob-light glow-gold-light animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full glow-blob-light glow-rose-light opacity-20" />
        
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.4]" style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,168,83,0.1) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 border border-orange-200">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Premium Fitness</span>
              </div>
            </motion.div>

            {/* Heading */}
            <h1 className="heading-xl text-charcoal">
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
                className="block text-gradient"
              >
                BODY TODAY
              </motion.span>
            </h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-muted max-w-lg leading-relaxed"
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
                <button className="btn-premium btn-primary">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/pricing">
                <button className="btn-premium btn-ghost">
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
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gold"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <AnimatedCounter value={stat.number} />
                  <p className="text-sm text-light-muted uppercase tracking-wider mt-2">{stat.label}</p>
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
              {/* Glow */}
              <div className="absolute inset-10 bg-gradient-to-r from-orange-300/30 to-rose-300/30 rounded-full blur-3xl" />
              
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-premium">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                  alt="Fitness"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
              </div>

              {/* Floating Card 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white border border-gold rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-charcoal">500+</p>
                    <p className="text-sm text-muted">Calories Burned</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -top-4 -right-4 bg-white border border-gold rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-charcoal">#1 Rated</p>
                    <p className="text-sm text-muted">In The City</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-charcoal/20 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-orange-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="section-padding bg-white relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full glow-blob-light glow-orange-light opacity-20" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full glow-blob-light glow-gold-light opacity-15" />
      </div>

      <div className="relative z-10 container mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-premium mb-4">
            <Star className="w-4 h-4 text-gold-500" />
            Why Choose Us
          </span>
          <h2 className="heading-lg text-charcoal mt-4">
            PREMIUM <span className="text-gradient">FACILITIES</span>
          </h2>
          <p className="text-muted mt-4 max-w-2xl mx-auto">
            Experience world-class amenities designed to elevate your fitness journey to unprecedented heights.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-premium group hover-lift"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-3">{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
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
    <section className="section-padding bg-cream relative">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full glow-blob-light glow-gold-light opacity-15" />
      </div>

      <div className="relative z-10 container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-premium badge-gold mb-4">
            <Star className="w-4 h-4" />
            Membership Plans
          </span>
          <h2 className="heading-lg text-charcoal mt-4">
            CHOOSE YOUR <span className="text-gold-gradient">PLAN</span>
          </h2>
          <p className="text-muted mt-4 max-w-2xl mx-auto">
            Flexible plans designed to fit your lifestyle and fitness goals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`pricing-card ${plan.popular ? 'pricing-card-featured' : ''}`}
            >
              <h3 className="text-xl font-bold text-charcoal mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-black text-charcoal">₹{plan.price}</span>
                <span className="text-muted ml-2">{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted">
                    <Check className="w-5 h-5 text-gold-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`btn-premium w-full ${plan.popular ? 'btn-gold' : 'btn-secondary'}`}>
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
    <section className="section-padding bg-white relative">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-premium mb-4">
            <Star className="w-4 h-4 text-orange-500" />
            Testimonials
          </span>
          <h2 className="heading-lg text-charcoal mt-4">
            WHAT MEMBERS <span className="text-gradient">SAY</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="testimonial-card"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold-500 fill-gold-500" />
                ))}
              </div>
              <p className="text-muted mb-6 text-lg">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <img src={testimonial.image} alt={testimonial.name} className="testimonial-avatar" />
                <div>
                  <p className="font-bold text-charcoal">{testimonial.name}</p>
                  <p className="text-sm text-muted">{testimonial.role}</p>
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
    <section className="section-padding relative overflow-hidden bg-gradient-to-r from-orange-50 via-rose-50 to-amber-50">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full glow-blob-light glow-orange-light opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full glow-blob-light glow-gold-light opacity-25" />
      </div>

      <div className="relative z-10 container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-xl text-charcoal mb-6">
            READY TO <span className="text-gradient">TRANSFORM</span>?
          </h2>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Join thousands of members who have already started their fitness journey. Your transformation begins today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <button className="btn-premium btn-primary">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/pricing">
              <button className="btn-premium btn-gold">
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
      <div className="bg-gradient-to-b from-white via-ivory to-cream">
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