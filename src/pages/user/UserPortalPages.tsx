import { Outlet } from "react-router-dom";
import { useNav } from "../../contexts/NavContext";
import { LayoutDashboard, User, BadgeDollarSign, Calendar, DollarSign, Box } from "lucide-react";
import { useEffect } from "react";

export function UserPortalPages() {
  const { setGroups } = useNav();

  useEffect(() => {
    setGroups([
      {
        label: "Main", icon: LayoutDashboard,
        items: [{ name: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
      },
      {
        label: "My Account", icon: User,
        items: [
          { name: "subscription", label: "Subscription", icon: BadgeDollarSign },
          { name: "attendance", label: "Attendance", icon: Calendar },
        ],
      },
      {
        label: "Billing", icon: DollarSign,
        items: [
          { name: "payments", label: "Payments", icon: BadgeDollarSign },
          { name: "products", label: "Products", icon: Box },
        ],
      },
    ]);
    return () => setGroups([]);
  }, [setGroups]);

  return <Outlet />;
}