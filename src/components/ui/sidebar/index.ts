
export * from "./sidebar-context";
export * from "./sidebar-menu";
export * from "./types";
export * from "./sidebar-components";
export { SidebarRail } from "./sidebar-rail";

// For compatibility with existing code, also export from the main sidebar.tsx file
// This is a temporary solution until all components are properly moved to their respective files
export { 
  SidebarProvider,
  useSidebar 
} from "./sidebar-context";
