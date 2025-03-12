
import { 
  LayoutDashboard, 
  FileEdit, 
  Tags,
  PenSquare,
  Moon,
  LogOut,
  Settings,
  User,
  Shield,
  Users,
  Lock,
  LayoutGrid,
  BarChart,
  ScrollText,
  Activity,
  Flag
} from "lucide-react";

export interface AdminMenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const adminMenuItems: AdminMenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "System Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Banner Management",
    url: "/admin/banner",
    icon: Flag,
  },
  {
    title: "Security Monitoring",
    url: "/admin/security",
    icon: Lock,
  },
  {
    title: "Content Management",
    url: "/admin/content",
    icon: LayoutGrid,
  },
  {
    title: "Analytics & Reporting",
    url: "/admin/analytics",
    icon: BarChart,
  },
  {
    title: "Audit Logs",
    url: "/admin/audit-logs",
    icon: ScrollText,
  },
  {
    title: "Performance Metrics",
    url: "/admin/performance",
    icon: Activity,
  },
  {
    title: "Manage Blogs",
    url: "/admin/blogs",
    icon: FileEdit,
  },
  {
    title: "Manage Categories",
    url: "/admin/categories",
    icon: Tags,
  },
  {
    title: "New Blog Post",
    url: "/admin/new-post",
    icon: PenSquare,
  },
];
