import { Outlet } from "react-router-dom";
import { useNav } from "../../contexts/NavContext";
import { LayoutDashboard, Users, Calendar, MessageSquare, DollarSign, CreditCard, TrendingUp, ShoppingBag, Box, ClipboardList, Settings, ShoppingCart, Phone, Clock, BadgeDollarSign, Wallet } from "lucide-react";
import { useEffect } from "react";

export function AdminPortalPages() {
  const { setGroups } = useNav();

  useEffect(() => {
    setGroups([
      {
        label: "Main", icon: LayoutDashboard,
        items: [{ name: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
      },
      {
        label: "Management", icon: Users,
        items: [
          { name: "users", label: "Users", icon: Users },
          { name: "attendance", label: "Attendance", icon: Calendar },
          {
            name: "inquiries", label: "Inquiries", icon: MessageSquare,
            subItems: [
              { name: "inquiries-subscriptions", label: "Subscriptions", icon: CreditCard, href: "/admin/inquiries?tab=subscriptions" },
              { name: "inquiries-products", label: "Product Orders", icon: ShoppingCart, href: "/admin/inquiries?tab=products" },
              { name: "inquiries-contacts", label: "Contact", icon: Phone, href: "/admin/inquiries?tab=contacts" },
              { name: "inquiries-expiry", label: "Upcoming Renewals", icon: Clock, href: "/admin/inquiries?tab=expiry" },
            ],
          },
        ],
      },
      {
        label: "Finance", icon: DollarSign,
        items: [
          { name: "subscriptions", label: "Subscriptions", icon: BadgeDollarSign },
          { name: "payments", label: "Payments", icon: Wallet },
          { name: "revenueops", label: "Revenue", icon: TrendingUp },
        ],
      },
      {
        label: "Products", icon: ShoppingBag,
        items: [{ name: "products", label: "Products", icon: Box }],
      },
      {
        label: "More", icon: Settings,
        items: [
          { name: "plans", label: "Plans", icon: ClipboardList },
          { name: "settings", label: "Settings", icon: Settings },
        ],
      },
    ]);
    return () => setGroups([]);
  }, [setGroups]);

  return <Outlet />;
}