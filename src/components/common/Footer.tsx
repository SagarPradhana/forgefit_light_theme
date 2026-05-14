import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon, LinkedinIcon } from "./SocialIcons";
import { useGymStore } from "../../store/gymStore";

const footerSections = [
  { title: "Quick Links", links: [{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Services", href: "/services" }, { label: "Pricing", href: "/pricing" }] },
  { title: "Resources", links: [{ label: "Testimonials", href: "/testimonials" }, { label: "Contact", href: "/contact" }, { label: "Blog", href: "#" }, { label: "FAQ", href: "#" }] },
  { title: "Legal", links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms & Conditions", href: "#" }, { label: "Cookie Policy", href: "#" }, { label: "Disclaimer", href: "#" }] },
];

export function Footer() {
  const { publicAppConfig, publicLocations, isLoadingPublicData } = useGymStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const socialLinks = [
    { icon: FacebookIcon, href: publicAppConfig?.facebook_url || "#", label: "Facebook" },
    { icon: InstagramIcon, href: publicAppConfig?.instagram_url || "#", label: "Instagram" },
    { icon: TwitterIcon, href: publicAppConfig?.twitter_url || "#", label: "Twitter" },
    { icon: YoutubeIcon, href: publicAppConfig?.youtube_url || "#", label: "YouTube" },
    { icon: LinkedinIcon, href: publicAppConfig?.linkedin_url || "#", label: "LinkedIn" },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative border-t border-gold-400/20 bg-gradient-to-b from-white to-cream-100 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-gold-400/20 to-amber-400/10 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-pink-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 pb-16 border-b border-gold-400/20"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ rotate: 180 }} className="p-2.5 bg-gradient-to-br from-accent-indigo to-accent-violet rounded-xl shadow-gold overflow-hidden flex items-center justify-center">
                  {isLoadingPublicData ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : publicAppConfig?.logo_image_path ? (
                    <img src={publicAppConfig.logo_image_path} alt={publicAppConfig.brand_name} className="w-6 h-6 object-contain" />
                  ) : (
                    <Dumbbell className="w-6 h-6 text-white" />
                  )}
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{publicAppConfig?.brand_name || "ForgeFit"}</h3>
              </div>
              <p className="text-slate-600 max-w-md leading-relaxed">
                {publicAppConfig?.description || "Transform your body, elevate your mind. Join our community of fitness enthusiasts and achieve your goals with expert guidance."}
              </p>

              <div className="space-y-6 mt-8">
                {publicLocations.length > 0 ? (
                  publicLocations.map((loc, i) => (
                    <motion.div key={loc.id || i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }} className="space-y-3 relative pl-6 border-l-2 border-gold-400/30 group">
                      <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-gold-400 to-gold-500 group-hover:h-full transition-all duration-500" />
                      <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-1">{loc.name || `Studio ${i + 1}`}</p>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-accent-indigo shrink-0 mt-0.5" />
                        <p className="text-slate-600 text-sm">{loc.address}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-accent-indigo shrink-0" />
                        <p className="text-slate-600 text-sm">{loc.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-accent-indigo shrink-0" />
                        <p className="text-slate-600 text-sm">{loc.email}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-4 h-4 text-accent-indigo" />
                      <p className="text-slate-600 text-sm">Ahmedabad, Gujarat, India</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Phone className="w-4 h-4 text-accent-indigo" />
                      <p className="text-slate-600 text-sm">+91 98765 43210</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Mail className="w-4 h-4 text-accent-indigo" />
                      <p className="text-slate-600 text-sm">support@forgefit.com</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-cream-50 to-rose-50 rounded-2xl border border-gold-400/20 p-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <h4 className="text-lg font-semibold text-slate-800 mb-2 relative z-10">Stay Updated</h4>
              <p className="text-slate-600 mb-6 text-sm relative z-10">Subscribe to get the latest fitness tips and exclusive offers.</p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4 relative z-10">
                <div className="relative">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full bg-white border border-cream-200 rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/10 transition-all" />
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-lg transition-all duration-300">
                  <span>Subscribe Now</span>
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>

              {subscribed && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm text-center">
                  ✓ Thank you for subscribing!
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-16">
            {footerSections.map((section, sIdx) => (
              <div key={section.title}>
                <motion.h4 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: sIdx * 0.1 }} className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-6 border-l-2 border-gold-400 pl-3">
                  {section.title}
                </motion.h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <motion.li key={link.label} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                      <Link to={link.href} className="text-slate-600 hover:text-gold-500 transition-all duration-300 text-sm flex items-center group">
                        <span className="w-0 group-hover:w-2 h-[1px] bg-gold-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mb-16 pb-16 border-b border-gold-400/20">
            {socialLinks.map((social, i) => (
              <motion.a key={social.label} href={social.href} aria-label={social.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.15, rotate: 5 }} whileTap={{ scale: 0.9 }} className="p-4 bg-white border border-cream-200 rounded-2xl text-slate-600 hover:text-gold-500 hover:border-gold-400 hover:shadow-gold transition-all duration-300">
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} className="flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
            <p>© {new Date().getFullYear()} {publicAppConfig?.brand_name || "ForgeFit"}. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold-500 transition-colors">Cookies</a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}