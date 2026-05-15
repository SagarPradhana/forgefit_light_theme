import { useState, useEffect } from "react";
import { GlowButton } from "../../ui/primitives";
import { toast } from "../../../store/toastStore";
import { adminAppConfigService, type AppConfigData } from "../../../services/adminAppConfigService";
import { handlePhoneKeyDown, handlePhonePaste, sanitizePhone } from "../../../utils/formUtils";

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

import { useGymStore } from "../../../store/gymStore";

export function AppConfigTab() {
  const { fetchPublicData } = useGymStore();
  const [loading, setLoading] = useState(false);
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
      if (langRes?.data) {
        setLanguages(langRes.data);
      } else if (langRes && typeof langRes === 'object') {
        setLanguages(langRes);
      }

      const tzRes = await adminAppConfigService.getTimezones();
      if (tzRes?.data && !tzRes["Africa/Abidjan"]) {
        setTimezones(tzRes.data);
      } else if (tzRes && typeof tzRes === 'object') {
        setTimezones(tzRes);
      }
    } catch (e) {
      console.error("Failed to fetch dropdown data:", e);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await adminAppConfigService.getConfig();
      // API returns config fields at root level (brand_name, logo_image_path, etc.)
      // data[] is empty — the config object IS the response itself
      const cfg = (res?.brand_name !== undefined)
        ? res                        // root-level response (actual API shape)
        : (res?.data?.[0] ?? null);  // fallback: nested in data[]

      if (cfg) {
        setConfig({
          id: cfg.id,
          brand_name: cfg.brand_name || "",
          logo_image_path: cfg.logo_image_path || "",
          gym_in_out_limit_in_hrs: Math.round((Number(cfg.gym_in_out_limit_in_hrs) || 0) * 100) / 100,
          theme_name: cfg.theme_name || "",
          description: cfg.description || "",
          timezone: String(cfg.timezone) || "0",
          currency: cfg.currency || "",
          language: cfg.language || "",
          country: cfg.country || "",
          email: cfg.email || "",
          phone: cfg.phone || "",
          whatsapp: cfg.whatsapp || "",
          facebook_url: cfg.facebook_url || "",
          instagram_url: cfg.instagram_url || "",
          twitter_url: cfg.twitter_url || "",
          linkedin_url: cfg.linkedin_url || "",
          tiktok_url: cfg.tiktok_url || "",
          youtube_url: cfg.youtube_url || "",
          website_url: cfg.website_url || "",
          expiry_reminder_days: Number(cfg.expiry_reminder_days) || 7,
        });
        if (cfg.logo_image_path) setLogoPreview(cfg.logo_image_path);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...config };
      delete payload.id;
      delete payload.logo_image_path;

      await adminAppConfigService.saveConfig(payload);
      toast.success("App configuration saved successfully!");
      await fetchConfig();
      await fetchPublicData(); // Refresh global public state
    } catch (err) {
      console.error(err);
      toast.error("Failed to save app configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await adminAppConfigService.uploadLogo(file);
      toast.success("Logo uploaded successfully!");
      await fetchConfig();
      await fetchPublicData(); // Refresh global public state
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload logo.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Branding */}
      <div className="rounded-lg bg-white/5 p-4 space-y-4">
        <h4 className="text-lg font-semibold text-white">App Branding</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Brand Name</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.brand_name || ""}
              onChange={(e) => setConfig({ ...config, brand_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Upload Logo</label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="h-10 w-10 shrink-0 bg-white/10 rounded overflow-hidden">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="flex-1 text-sm text-slate-300 file:mr-2 file:rounded file:border-0 file:bg-indigo-600 file:px-2 file:py-1 file:text-white file:hover:bg-indigo-700"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              rows={3}
              value={config.description || ""}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-lg bg-white/5 p-4 space-y-4">
        <h4 className="text-lg font-semibold text-white">Global Settings</h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Gym In/Out Limit (HH:MM)</label>
            <input
              type="time"
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              style={{ colorScheme: "dark" }}
              value={formatHoursToTime(config.gym_in_out_limit_in_hrs)}
              onChange={(e) => setConfig({ ...config, gym_in_out_limit_in_hrs: parseTimeToHours(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Reminder (Days)</label>
            <input
              type="number"
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              placeholder="7"
              min="1"
              max="30"
              value={config.expiry_reminder_days || ""}
              onChange={(e) => setConfig({ ...config, expiry_reminder_days: parseInt(e.target.value) || 7 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Timezone (UTC Offset)</label>
            <select
              className="w-full rounded bg-white p-2 text-gray-700 border border-gray-200 [&>option]:bg-white"
              value={config.timezone || ""}
              onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
            >
              <option value="">Select Timezone</option>
              {Object.entries(timezones).map(([tz, offset]) => (
                <option key={tz} value={String(offset)}>UTC{offset >= 0 ? `+${offset}` : offset} - {tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Currency</label>
            <select
              className="w-full rounded bg-white p-2 text-gray-700 border border-gray-200 [&>option]:bg-white"
              value={config.currency || ""}
              onChange={(e) => setConfig({ ...config, currency: e.target.value })}
            >
              <option value="">Select Currency</option>
              {["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Language</label>
            <select
              className="w-full rounded bg-white p-2 text-gray-700 border border-gray-200 [&>option]:bg-white"
              value={config.language || ""}
              onChange={(e) => setConfig({ ...config, language: e.target.value })}
            >
              <option value="">Select Language</option>
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name as string}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Country</label>
            <select
              className="w-full rounded bg-white p-2 text-gray-700 border border-gray-200 [&>option]:bg-white"
              value={config.country || ""}
              onChange={(e) => setConfig({ ...config, country: e.target.value })}
            >
              <option value="">Select Country</option>
              {["United States", "United Kingdom", "India", "Australia", "Canada", "Germany", "France", "Japan", "China", "Brazil", "South Africa"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Social & Contact */}
      <div className="rounded-lg bg-white/5 p-4 space-y-4">
        <h4 className="text-lg font-semibold text-white">Contact & Social Links</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.email || ""}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.phone || ""}
              onChange={(e) => setConfig({ ...config, phone: sanitizePhone(e.target.value) })}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.whatsapp || ""}
              onChange={(e) => setConfig({ ...config, whatsapp: sanitizePhone(e.target.value) })}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Website URL</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.website_url || ""}
              onChange={(e) => setConfig({ ...config, website_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Facebook URL</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.facebook_url || ""}
              onChange={(e) => setConfig({ ...config, facebook_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Instagram URL</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.instagram_url || ""}
              onChange={(e) => setConfig({ ...config, instagram_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Twitter URL</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.twitter_url || ""}
              onChange={(e) => setConfig({ ...config, twitter_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn URL</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.linkedin_url || ""}
              onChange={(e) => setConfig({ ...config, linkedin_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">TikTok URL</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.tiktok_url || ""}
              onChange={(e) => setConfig({ ...config, tiktok_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">YouTube URL</label>
            <input
              className="w-full rounded bg-white/10 p-2 text-white border border-white/10"
              value={config.youtube_url || ""}
              onChange={(e) => setConfig({ ...config, youtube_url: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <GlowButton onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Submit"}
        </GlowButton>
      </div>
    </div>
  );
}
