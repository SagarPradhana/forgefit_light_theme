import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";

export interface DateRange {
  from_date?: number; // unix
  to_date?: number;   // unix
  label: string;
}

type Preset = "today" | "weekly" | "monthly" | "lastmonth" | "custom";

function toUnix(d: Date, end = false) {
  const copy = new Date(d);
  end ? copy.setHours(23, 59, 59, 999) : copy.setHours(0, 0, 0, 0);
  return Math.floor(copy.getTime() / 1000);
}

function fmtShort(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function buildRange(preset: Preset, customFrom: string, customTo: string): DateRange {
  const now = new Date();
  if (preset === "today") {
    return { from_date: toUnix(now), to_date: toUnix(now, true), label: "Today" };
  }
  if (preset === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    return { from_date: toUnix(start), to_date: toUnix(now, true), label: "This Week" };
  }
  if (preset === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from_date: toUnix(start), to_date: toUnix(now, true), label: "This Month" };
  }
  if (preset === "lastmonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end   = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from_date: toUnix(start), to_date: toUnix(end, true), label: "Last Month" };
  }
  // custom
  if (customFrom && customTo) {
    const s = new Date(customFrom), e = new Date(customTo);
    return { from_date: toUnix(s), to_date: toUnix(e, true), label: `${fmtShort(s)} – ${fmtShort(e)}` };
  }
  return { label: "Custom" };
}

interface Props {
  defaultPreset?: Preset;
  onChange: (range: DateRange) => void;
  className?: string;
}

const PRESETS: { id: Preset; label: string }[] = [
  { id: "today",     label: "Today" },
  { id: "weekly",    label: "This Week" },
  { id: "monthly",   label: "This Month" },
  { id: "lastmonth", label: "Last Month" },
  { id: "custom",    label: "Custom Range" },
];

export function DateRangeFilter({ defaultPreset = "today", onChange, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>(defaultPreset);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const [label, setLabel] = useState(buildRange(defaultPreset, "", "").label);
  const ref = useRef<HTMLDivElement>(null);


  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const apply = (p: Preset, cf = customFrom, ct = customTo) => {
    if (p === "custom" && (!cf || !ct)) return; // wait for both dates
    const r = buildRange(p, cf, ct);
    setLabel(r.label);
    onChange(r);
    if (p !== "custom") setOpen(false);
  };

  const selectPreset = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") apply(p);
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) return;
    apply("custom", customFrom, customTo);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreset(defaultPreset);
    setCustomFrom("");
    setCustomTo("");
    const r = buildRange(defaultPreset, "", "");
    setLabel(r.label);
    onChange(r);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-orange-400 hover:bg-orange-50 transition-all min-w-[160px]"
      >
        <Calendar size={13} className="text-orange-500 shrink-0" />
        <span className="flex-1 text-left truncate">{label}</span>
        {preset !== defaultPreset || customFrom ? (
          <X size={11} className="text-slate-500 hover:text-red-400 transition-colors shrink-0" onClick={clear} />
        ) : (
          <ChevronDown size={12} className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""} shrink-0`} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
          {/* Preset list */}
          <div className="p-2 space-y-0.5">
            {PRESETS.map(({ id, label: pl }) => (
              <button
                key={id}
                onClick={() => selectPreset(id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  preset === id
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {pl}
              </button>
            ))}
          </div>

          {/* Custom date pickers */}
          {preset === "custom" && (
            <div className="border-t border-gray-200 p-3 space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Select Date Range</p>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-orange-500 transition cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">To</label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-orange-500 transition cursor-pointer"
                />
              </div>
              {customFrom && customTo && (
                <p className="text-[9px] text-orange-600 font-bold text-center py-1">
                  {fmtShort(new Date(customFrom))} → {fmtShort(new Date(customTo))}
                </p>
              )}
              <button
                onClick={applyCustom}
                disabled={!customFrom || !customTo}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-widest disabled:opacity-40 hover:opacity-90 transition mt-1"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
