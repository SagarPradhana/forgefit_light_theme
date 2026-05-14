import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Home, Info, Briefcase, CreditCard, MessageSquare, Phone, Menu, X, MessageCircle, ArrowRight } from "lucide-react";
import { ThemeProvider } from "../components/ui/ThemeProvider";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import { useGymStore } from "../store/gymStore";
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon, LinkedinIcon } from "../components/common/SocialIcons";
import "../styles/public_redesign.css";
import "../styles/premium.css";

function PremiumNav({ onMobileOpen }: { onMobileOpen: () => void }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { publicAppConfig, isLoadingPublicData } = useGymStore();

  const brandName = isLoadingPublicData ? "" : (publicAppConfig?.brand_name || "FORGEFIT");
  const logoUrl = publicAppConfig?.logo_image_path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/pricing", label: "Pricing" },
    { path: "/testimonials", label: "Testimonials" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`navbar fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${scrolled ? 'navbar-solid-light py-3' : 'navbar-transparent-light py-5'}`}>
      {/* Dynamic Accent Line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrolled ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-orange)] to-transparent opacity-30" 
      />
      
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <div className="relative">
                <img src={logoUrl} alt={brandName} className="h-10 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-[var(--accent-orange)] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-display font-bold tracking-tight text-charcoal leading-none">
                {brandName.split(' ').map((word, i) => (
                  <span key={i} className={i === brandName.split(' ').length - 1 ? 'text-[var(--accent-orange)]' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-black opacity-60">Elite Fitness</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => `
                  nav-link-premium relative px-4 py-2 text-[13px] font-bold tracking-widest uppercase transition-all duration-300
                  ${isActive ? 'active text-[var(--accent-orange)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action Side */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center h-full">
              <LanguageSwitcher />
            </div>
            
            <Link to="/signin" className="text-[11px] uppercase tracking-[0.2em] font-black text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-all duration-300 relative group flex items-center h-full">
              Sign In
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent-orange)] transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link to="/contact" className="flex items-center h-full">
              <button className="btn-premium btn-primary !py-2.5 !px-6 !text-[11px] group relative overflow-hidden shadow-none hover:shadow-lg">
                <span className="relative z-10 flex items-center gap-2">
                  Join Now
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
              </button>
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className="lg:hidden p-2 rounded-xl hover:bg-cream-100 transition-colors text-charcoal" 
            onClick={onMobileOpen}
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { publicAppConfig } = useGymStore();
  const brandName = publicAppConfig?.brand_name || "FORGEFIT";

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/services", label: "Services", icon: Briefcase },
    { path: "/pricing", label: "Pricing", icon: CreditCard },
    { path: "/testimonials", label: "Testimonials", icon: MessageSquare },
    { path: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-md z-[60] lg:hidden"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[85%] max-w-md bg-white z-[70] lg:hidden shadow-2xl border-l border-cream-200"
          >
            <div className="p-8 pt-24">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center shadow-lg">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-display font-bold tracking-tight text-charcoal">{brandName}</span>
              </div>
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                        ? 'bg-gradient-to-r from-[var(--accent-orange)]/10 to-[var(--accent-gold)]/10 text-[var(--accent-orange)] border border-[var(--border-accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-lg">{item.label}</span>
                      {isActive && <ArrowRight className="w-5 h-5 ml-auto" />}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
              <div className="flex gap-3">
                <Link to="/signin" onClick={onClose} className="flex-1 text-center py-4 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors">
                  Sign In
                </Link>
                <Link to="/contact" onClick={onClose} className="flex-1">
                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Join Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    );
}


function FloatingWhatsAppButton() {
  const { publicAppConfig } = useGymStore();
  const whatsappNumber = (publicAppConfig?.whatsapp || "").replace(/[^\d]/g, "");
  if (!whatsappNumber) return null;

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-shadow"
    >
      <MessageCircle size={24} />
    </motion.a>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-b from-white via-ivory to-cream text-charcoal">
        <PremiumNav onMobileOpen={() => setMobileMenuOpen(true)} />
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="pt-20">
          {children}
        </main>

        <FloatingWhatsAppButton />
        <PremiumFooter />
      </div>
    </ThemeProvider>
  );
}

function PremiumFooter() {
  const { publicAppConfig, isLoadingPublicData } = useGymStore();
  const brandName = isLoadingPublicData ? "" : (publicAppConfig?.brand_name || "FORGE");
  const logoUrl = publicAppConfig?.logo_image_path;
  const description = publicAppConfig?.description || "";

  const footerLinks = {
    company: ["About Us", "Careers", "Press", "Blog"],
    support: ["Help Center", "Contact Us", "FAQ", "Classes"],
    legal: ["Privacy", "Terms", "Cookies", "Accessibility"],
  };

  const socials = [
    { icon: InstagramIcon, href: publicAppConfig?.instagram_url || "#", label: "Instagram" },
    { icon: TwitterIcon, href: publicAppConfig?.twitter_url || "#", label: "Twitter" },
    { icon: FacebookIcon, href: publicAppConfig?.facebook_url || "#", label: "Facebook" },
    { icon: YoutubeIcon, href: publicAppConfig?.youtube_url || "#", label: "Youtube" },
  ];

  return (
    <footer className="bg-cream border-t border-pearl pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-10 w-auto" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-gold)] flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-2xl font-display font-bold text-charcoal">{brandName}</span>
            </Link>
            <p className="text-muted mb-6 max-w-sm">
              {description || "Transform your body and mind with premium fitness facilities and expert guidance. Join the movement today."}
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a key={social.label} href={social.href} className="social-icon-light" aria-label={social.label}>
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-charcoal mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link}><a href="#" className="text-muted hover:text-[var(--accent-orange)] transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link}><a href="#" className="text-muted hover:text-[var(--accent-orange)] transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link}><a href="#" className="text-muted hover:text-[var(--accent-orange)] transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-12 shadow-soft">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-charcoal mb-2">Stay Updated</h3>
              <p className="text-muted">Get the latest fitness tips and exclusive offers.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-light flex-1 md:w-64"
              />
              <button className="btn-premium btn-primary !px-6">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="divider-gold mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} {brandName.toUpperCase()}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--accent-orange)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--accent-orange)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}