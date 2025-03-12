
// Re-export all sidebar components from their respective files
export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from "./sidebar-core";

export {
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarInput,
} from "./sidebar-sections";

export {
  SidebarGroup,
  SidebarGroupLabel, 
  SidebarGroupAction,
  SidebarGroupContent,
} from "./sidebar-group";

export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./sidebar-menu";

export { useSidebar } from "./sidebar-context";
