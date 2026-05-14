import { Outlet } from "react-router-dom";
import { useNav } from "../../contexts/NavContext";
import { LayoutDashboard, Calendar, Dumbbell, ClipboardList } from "lucide-react";
import { useEffect } from "react";

export function TrainerPortalPages() {
  const { setGroups } = useNav();

  useEffect(() => {
    setGroups([
      {
        label: "Main", icon: LayoutDashboard,
        items: [
          { name: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { name: "attendance", label: "Attendance", icon: Calendar },
        ],
      },
      {
        label: "Programs", icon: Dumbbell,
        items: [
          { name: "workouts", label: "Workouts", icon: Dumbbell },
          { name: "diets", label: "Diets", icon: ClipboardList },
        ],
      },
    ]);
    return () => setGroups([]);
  }, [setGroups]);

  return <Outlet />;
}