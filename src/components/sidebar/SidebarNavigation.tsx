import { Home, PiggyBank, BarChart2, LineChart, ChartBar } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge } from "@/components/ui/sidebar";
const menuItems = [{
  title: "Overview",
  url: "/overview",
  icon: Home
}, {
  title: "Debts",
  url: "/overview/debts",
  icon: PiggyBank
}, {
  title: "Strategy",
  url: "/strategy",
  icon: BarChart2
}, {
  title: "Track",
  url: "/track",
  icon: LineChart,
  badge: "Coming Soon"
}, {
  title: "Reports",
  url: "/overview/reports",
  icon: ChartBar
}];
export function SidebarNavigation() {
  const location = useLocation();
  return <SidebarContent>
      
    </SidebarContent>;
}