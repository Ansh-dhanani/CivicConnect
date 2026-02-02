import { Banknote, ChartBar, Gauge, LayoutDashboard, type LucideIcon, SquareArrowUpRight } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "Complaints",
        url: "/dashboard/complaints",
        icon: Banknote,
      },
      {
        title: "Analytics",
        url: "/dashboard/coming-soon",
        icon: Gauge,
        comingSoon: true,
      },
    ],
  },
  {
    id: 2,
    label: "Misc",
    items: [
      {
        title: "Others",
        url: "/dashboard/coming-soon",
        icon: SquareArrowUpRight,
        comingSoon: true,
      },
    ],
  },
];
