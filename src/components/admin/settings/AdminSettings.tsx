import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, MapPin, FileText } from "lucide-react";
import { AppConfigTab } from "./AppConfigTab";
import { LocationsTab } from "./LocationsTab";
import { PublicPagesTab } from "./PublicPagesTab";

const tabs = [
  { id: "app" as const, label: "App Config", icon: Settings },
  { id: "locations" as const, label: "Locations", icon: MapPin },
  { id: "pages" as const, label: "Public Pages", icon: FileText },
];

export function AdminSettings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"app" | "locations" | "pages">("app");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("settings") || "Settings"}</h1>
        <p className="text-gray-500 mt-1">Configure your app, locations, and public pages.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex px-6" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center gap-2.5 px-5 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                    isActive
                      ? "border-orange-500 text-orange-600 bg-orange-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "app" && <AppConfigTab />}
          {activeTab === "locations" && <LocationsTab />}
          {activeTab === "pages" && <PublicPagesTab />}
        </div>
      </div>
    </div>
  );
}
