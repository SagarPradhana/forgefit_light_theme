import { motion } from "framer-motion";
import { PublicLayout } from "../../layouts/PublicLayout";
import {
  Users,
  Trophy,
  Flame,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import { Counter } from "../../components/common/Counter";

const trustItems = [
  {
    icon: Users,
    title: "Expert Coaches",
    description: "Certified trainers design every workout around your goals.",
  },
  {
    icon: Trophy,
    title: "Proven Results",
    description:
      "Track records of stronger bodies, safer progress, and happier members.",
  },
  {
    icon: Flame,
    title: "Performance-Led",
    description:
      "Training, recovery, and nutrition all built for real, sustainable gains.",
  },
  {
    icon: Dumbbell,
    title: "Premium Facility",
    description:
      "Modern equipment, clean spaces, and a motivating gym experience.",
  },
];

import { useGymStore } from "../../store/gymStore";
import { Link } from "react-router-dom";
import { BannerCarousel } from "../../components/common/BannerCarousel";
import { NoDataFound } from "../../components/ui/NoDataFound";

export function AboutPage() {
  const { publicAppConfig, publicBanners, publicLocations, isLoadingPublicData } = useGymStore();
  const brandName = isLoadingPublicData ? "" : (publicAppConfig?.brand_name || "ForgeFit");
  const mainLocation = publicLocations[0];
  const aboutBanners = publicBanners["about"] || [];
  const trainerBanners = publicBanners["trainers"] || [];

  return (
    <PublicLayout>
      <div className="relative isolate min-h-screen overflow-hidden">
        <section className="relative min-h-[70vh] overflow-hidden pt-6 sm:pt-12">
          <div className="absolute inset-0">
            <BannerCarousel banners={aboutBanners} isLoading={isLoadingPublicData} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hero-badge"
              >
                The {brandName} Story
              </motion.div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 sm:mb-8 uppercase leading-[0.9]">
                ENGINEERED FOR <br /><span className="text-cinematic">GREATNESS.</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-3xl">
                {publicAppConfig?.description || `${brandName} isn't just a gym; it's a performance laboratory. Founded on the principles of science-based training and elite-level recovery, we provide the tools and atmosphere for those who refuse to settle for average.`}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="stat-card py-4 sm:py-6">
                  <p className="text-2xl sm:text-4xl font-extrabold text-white"><Counter to={10} suffix="+" /></p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Years Experience</p>
                </div>
                <div className="stat-card py-4 sm:py-6">
                  <p className="text-2xl sm:text-4xl font-extrabold text-white"><Counter to={500} suffix="+" /></p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Athletes</p>
                </div>
              </div>
              {mainLocation && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-bold mb-2">Based In</p>
                  <p className="text-white text-sm">{mainLocation.address}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="bg-mesh" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <section className="mb-16 sm:mb-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="glass-panel p-6 sm:p-8 inline-block">
                <Sparkles className="text-orange-400 mb-2" size={20} />
                <p className="text-white font-bold text-xs sm:text-sm">{mainLocation?.gym_open_status ? "Gym Open Today" : "Check Working Hours"}</p>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-1">{mainLocation ? `${mainLocation.working_hours_from_time} - ${mainLocation.working_hours_to_time}` : "Access to infrared saunas and expert physio support."}</p>
              </div>
            </div>
          </section>

          {/* Pillars Section */}
          <section className="py-20 border-t border-white/5">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">OUR CORE PILLARS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustItems.map((item, i) => (
                <div key={i} className="glass-panel p-8 group hover:bg-orange-500/5 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-white font-bold mb-3 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Meet the Trainers Section */}
          <section className="py-24 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-[0.9]">ELITE <span className="text-cinematic">COACHING</span> TEAM</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {isLoadingPublicData ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="group relative overflow-hidden rounded-3xl h-[320px] md:h-[380px] bg-slate-900 animate-pulse">
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <div className="h-3 w-1/3 bg-slate-800 rounded mb-2"></div>
                      <div className="h-8 w-2/3 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                ))
              ) : trainerBanners.length > 0 ? (
                trainerBanners.slice(0, 3).map((trainer, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-3xl h-[320px] md:h-[380px] bg-white/5 border border-white/10">
                    <img
                      src={trainer.file_path}
                      alt={`Coach ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                      <p className="text-orange-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Coaching Team</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-3">
                  <NoDataFound title="No Coach Images" subtitle="Upload trainer banners to show the coaching gallery here." />
                </div>
              )}
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 relative">
            <div className="glass-panel p-12 md:p-20 text-center border-orange-500/30">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase">START YOUR <span className="text-cinematic">JOURNEY</span></h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">Join a community where results aren't just promised, they're engineered. Your first session is on us.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact">
                  <button className="btn-premium px-12 py-5 text-xl">JOIN THE LEGACY</button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
