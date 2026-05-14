import { createContext, useContext, useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  label: string;
  icon: LucideIcon;
  subItems?: { name: string; label: string; icon: LucideIcon; href?: string }[];
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

interface NavContextType {
  groups: NavGroup[];
  setGroups: (groups: NavGroup[]) => void;
}

const NavContext = createContext<NavContextType>({ groups: [], setGroups: () => {} });

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<NavGroup[]>([]);
  return (
    <NavContext.Provider value={{ groups, setGroups }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}