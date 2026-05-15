import { motion } from "framer-motion";
import { useState } from "react";
import { PublicLayout } from "../../layouts/PublicLayout";
import { Phone, Mail, MapPin } from "lucide-react";
import { appInquiryService } from "../../services/appInquiryService";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../utils/formUtils";

import { useGymStore } from "../../store/gymStore";

export function ContactPage() {
  const { publicAppConfig, publicLocations, publicBanners, isLoadingPublicData } = useGymStore();

  const mainLocation = publicLocations[0];
  const brandName = isLoadingPublicData ? "" : (publicAppConfig?.brand_name || "ForgeFit");
  const contactPhone = mainLocation?.phone || publicAppConfig?.phone || "+91 98765 43210";
  const contactEmail = mainLocation?.email || publicAppConfig?.email || "support@forgefit.com";
  const contactAddress = mainLocation?.address || "Ahmedabad, Gujarat, India";
  const workingHoursFrom = mainLocation?.working_hours_from_time || "06:00";
  const workingHoursTo = mainLocation?.working_hours_to_time || "22:00";
  const contactBanner = publicBanners["common"]?.[0]?.file_path || "/assets/redesign/interior.png";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate phone number format (at least 7 digits)
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      setError("Please enter a valid phone number (at least 7 digits).");
      return;
    }

    setLoading(true);
    try {
      await appInquiryService.createContactInquiry(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="relative isolate min-h-screen overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="bg-mesh" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <section className="text-center mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-badge"
            >
              Get in Touch
            </motion.div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 sm:mb-8 uppercase leading-[0.9]">
              START YOUR <br/><span className="text-cinematic">LEGACY.</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
              Have questions? Our elite support team is ready to guide you through your transformation journey.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass-panel p-8 group hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Call Us</p>
                    <p className="text-white font-bold text-lg">{contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Email Us</p>
                    <p className="text-white font-bold text-lg">{contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Visit Us</p>
                    <p className="text-white font-bold text-lg">{contactAddress}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8">
                <h3 className="text-white font-black uppercase tracking-tight mb-6">OPERATING HOURS</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Mon - Fri</span>
                    <span className="text-white font-bold">{workingHoursFrom} - {workingHoursTo}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Sat - Sun</span>
                    <span className="text-white font-bold">{workingHoursFrom} - {workingHoursTo}</span>
                  </div>
                </div>
                <div className="mt-8 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-center">
                  <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">24/7 Access for Elite Members</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32 rounded-full" />
                <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight relative z-10">SEND A MESSAGE</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">Message sent successfully! We'll contact you shortly.</div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Phone Number</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Subject</label>
                      <input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all"
                        placeholder="General Inquiry"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all resize-none"
                      placeholder="Tell us about your goals..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-premium w-full py-5 text-xl disabled:opacity-50"
                  >
                    {loading ? "SENDING..." : "SEND MESSAGE"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Map / Visual Section */}
          <section className="mb-24">
            <div className="relative h-[250px] md:h-[400px] rounded-[2.5rem] overflow-hidden group">
              <img 
                src={contactBanner} 
                alt="Gym Map" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-slate-950/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass-panel p-8 text-center max-w-sm">
                  <MapPin className="text-orange-400 mx-auto mb-4" size={48} />
                  <h3 className="text-2xl font-black text-white uppercase mb-2">VISIT THE LAB</h3>
                  <p className="text-slate-300 text-sm">Experience the intensity in person. Book a studio tour today.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
