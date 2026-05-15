import { useState, useEffect } from "react";
import { GlowButton, ButtonLoader } from "../../ui/primitives";
import { toast } from "../../../store/toastStore";
import { adminAppConfigService, type AppConfigData } from "../../../services/adminAppConfigService";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../../utils/formUtils";
import { useGymStore } from "../../../store/gymStore";
import { Upload, Building2, Globe, Link as LinkIcon } from "lucide-react";

const formatHoursToTime = (hours: number): string => {
  if (!hours || isNaN(hours)) return "00:00";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const parseTimeToHours = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return Number((h + (m / 60)).toFixed(2));
};

const inp = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
const lbl = "block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5";
const sel = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all appearance-none cursor-pointer";

export function AppConfigTab() {
  const { fetchPublicData } = useGymStore();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AppConfigData>({
    brand_name: "",
    gym_in_out_limit_in_hrs: 0,
    theme_name: "",
    description: "",
    timezone: "0",
    currency: "",
    language: "",
    country: "",
    email: "",
    phone: "",
    whatsapp: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    tiktok_url: "",
    youtube_url: "",
    website_url: "",
    expiry_reminder_days: 7,
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [timezones, setTimezones] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchConfig();
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const langRes = await adminAppConfigService.getLanguages();
      if (langRes?.data) setLanguages(langRes.data);
      else if (langRes && typeof langRes === 'object') setLanguages(langRes);
      const tzRes = await adminAppConfigService.getTimezones();
      if (tzRes?.data && !tzRes["Africa/Abidjan"]) setTimezones(tzRes.data);
      else if (tzRes && typeof tzRes === 'object') setTimezones(tzRes);
    } catch (e) { console.error("Failed to fetch dropdown data:", e); }
  };

  const fetchConfig = async () => {
    try {
      const res = await adminAppConfigService.getConfig();
      const cfg = (res?.brand_name !== undefined) ? res : (res?.data?.[0] ?? null);
      if (cfg) {
        setConfig({
          id: cfg.id, brand_name: cfg.brand_name || "", logo_image_path: cfg.logo_image_path || "",
          gym_in_out_limit_in_hrs: Math.round((Number(cfg.gym_in_out_limit_in_hrs) || 0) * 100) / 100,
          theme_name: cfg.theme_name || "", description: cfg.description || "",
          timezone: String(cfg.timezone) || "0", currency: cfg.currency || "", language: cfg.language || "",
          country: cfg.country || "", email: cfg.email || "", phone: cfg.phone || "", whatsapp: cfg.whatsapp || "",
          facebook_url: cfg.facebook_url || "", instagram_url: cfg.instagram_url || "", twitter_url: cfg.twitter_url || "",
          linkedin_url: cfg.linkedin_url || "", tiktok_url: cfg.tiktok_url || "", youtube_url: cfg.youtube_url || "",
          website_url: cfg.website_url || "", expiry_reminder_days: Number(cfg.expiry_reminder_days) || 7,
        });
        if (cfg.logo_image_path) setLogoPreview(cfg.logo_image_path);
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...config };
      delete payload.id; delete payload.logo_image_path;
      await adminAppConfigService.saveConfig(payload);
      toast.success("App configuration saved successfully!");
      await fetchConfig(); await fetchPublicData();
    } catch (err) {
      console.error(err); toast.error("Failed to save app configuration.");
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await adminAppConfigService.uploadLogo(file);
      toast.success("Logo uploaded successfully!");
      await fetchConfig(); await fetchPublicData();
    } catch (err) { console.error(err); toast.error("Failed to upload logo."); }
  };

  const update = <K extends keyof typeof config>(key: K, value: (typeof config)[K]) => setConfig({ ...config, [key]: value });

  return (
    <div className="space-y-8">
      {/* Branding */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <Building2 size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">App Branding</h3>
            <p className="text-xs text-gray-500">Your gym's public identity</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={lbl}>Brand Name</label>
            <input className={inp} value={config.brand_name || ""} onChange={(e) => update("brand_name", e.target.value)} placeholder="ForgeFit" />
          </div>
          <div>
            <label className={lbl}>Logo</label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-50">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-all text-sm font-medium text-gray-700">
                <Upload size={16} className="text-gray-400" />
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>Description</label>
            <textarea className={`${inp} resize-none h-24`} rows={3} value={config.description || ""} onChange={(e) => update("description", e.target.value)} placeholder="Tell your gym's story..." />
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <Globe size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Global Settings</h3>
            <p className="text-xs text-gray-500">Regional and operational configuration</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className={lbl}>Gym In/Out Limit</label>
            <input type="time" className={inp} value={formatHoursToTime(config.gym_in_out_limit_in_hrs)} onChange={(e) => update("gym_in_out_limit_in_hrs", parseTimeToHours(e.target.value))} />
          </div>
          <div>
            <label className={lbl}>Expiry Reminder (Days)</label>
            <input type="number" className={inp} min="1" max="30" value={config.expiry_reminder_days || ""} onChange={(e) => update("expiry_reminder_days", parseInt(e.target.value) || 7)} placeholder="7" />
          </div>
          <div>
            <label className={lbl}>Timezone</label>
            <select className={sel} value={config.timezone || ""} onChange={(e) => update("timezone", e.target.value)}>
              <option value="">Select Timezone</option>
              {Object.entries(timezones).map(([tz, offset]) => (
                <option key={tz} value={String(offset)}>UTC{offset >= 0 ? `+${offset}` : offset} - {tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Currency</label>
            <select className={sel} value={config.currency || ""} onChange={(e) => update("currency", e.target.value)}>
              <option value="">Select Currency</option>
              {["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY"].map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className={lbl}>Language</label>
            <select className={sel} value={config.language || ""} onChange={(e) => update("language", e.target.value)}>
              <option value="">Select Language</option>
              {Object.entries(languages).map(([code, name]) => (<option key={code} value={code}>{name as string}</option>))}
            </select>
          </div>
          <div>
            <label className={lbl}>Country</label>
            <select className={sel} value={config.country || ""} onChange={(e) => update("country", e.target.value)}>
              <option value="">Select Country</option>
              {["United States", "United Kingdom", "India", "Australia", "Canada", "Germany", "France", "Japan", "China", "Brazil", "South Africa"].map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact & Social */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <LinkIcon size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Contact & Social Links</h3>
            <p className="text-xs text-gray-500">How members reach you online</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={lbl}>Email</label>
            <input className={inp} value={config.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="contact@gym.com" />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input className={inp} value={config.phone || ""} onChange={(e) => update("phone", sanitizePhone(e.target.value))} onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className={lbl}>WhatsApp</label>
            <input className={inp} value={config.whatsapp || ""} onChange={(e) => update("whatsapp", sanitizePhone(e.target.value))} onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className={lbl}>Website</label>
            <input className={inp} value={config.website_url || ""} onChange={(e) => update("website_url", e.target.value)} placeholder="https://gym.com" />
          </div>
          {[
            ["Facebook", "facebook_url"],
            ["Instagram", "instagram_url"],
            ["Twitter", "twitter_url"],
            ["LinkedIn", "linkedin_url"],
            ["TikTok", "tiktok_url"],
            ["YouTube", "youtube_url"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className={lbl}>{label}</label>
              <input className={inp} value={(config as any)[key] || ""} onChange={(e) => update(key as keyof typeof config, e.target.value)} placeholder={`${label.toLowerCase()}.com/...`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <GlowButton onClick={handleSave} disabled={saving} className="min-w-[140px]">
          <ButtonLoader label="Save Settings" loadingLabel="Saving..." loading={saving} />
        </GlowButton>
      </div>
    </div>
  );
}
