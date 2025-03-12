
// Export the context provider and hook
export { SidebarProvider, useSidebar } from "./sidebar-context";

// Export type definitions
export * from "./types";

// Export all components from the main sidebar.tsx file
// This ensures all components are properly available without import conflicts
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar/sidebar-components";
