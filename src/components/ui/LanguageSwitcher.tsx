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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-accent)] transition-all text-[var(--text-secondary)] font-medium text-sm"
      >
        <Languages size={16} className="text-[var(--accent-orange)]" />
        <span className="text-sm font-semibold">{currentLang?.flag} {currentLang?.name}</span>
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-hover)] z-[200] overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                i18n.language === lang.code
                  ? "bg-gradient-to-r from-[var(--accent-orange)]/10 to-[var(--accent-gold)]/10 text-[var(--accent-orange)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
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