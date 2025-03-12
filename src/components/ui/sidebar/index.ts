
// Export the context and provider
export * from "./sidebar-context";

// Export type definitions
export * from "./types";

// Export components from sidebar-components without ambiguity
export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarInput,
  SidebarInset,
  SidebarSeparator
} from "./sidebar-components";

// Export components from sidebar-menu without ambiguity
export {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "./sidebar-menu";

// Export SidebarRail
export { SidebarRail } from "./sidebar-rail";
