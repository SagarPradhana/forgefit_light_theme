import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages, ChevronDown } from "lucide-react";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "or", name: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gold-400/20 shadow-sm hover:shadow-gold hover:border-gold-400/40 transition-all text-slate-700 font-medium text-sm"
      >
        <Languages size={16} className="text-gold-500" />
        <span className="text-sm font-semibold">{currentLang?.flag} {currentLang?.name}</span>
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-white border border-gold-400/20 shadow-elegant-lg z-[200] overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                i18n.language === lang.code
                  ? "bg-gradient-to-r from-gold-400/10 to-amber-400/10 text-gold-600"
                  : "text-slate-600 hover:bg-cream-50 hover:text-slate-800"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;