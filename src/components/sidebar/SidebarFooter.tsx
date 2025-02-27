import { Settings, Moon, Sun, UserCircle, CreditCard, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarFooter as Footer,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export function SidebarFooter() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Ensure theme is only accessed after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Set initial theme if none is set
    if (!theme) {
      setTheme('light');
    }
    console.log("Theme mounted:", theme);
  }, [theme, setTheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log("Toggling theme from", theme, "to", newTheme);
    setTheme(newTheme);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    console.log("Toggling settings visibility:", !showSettings);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Footer>
      <SidebarSeparator className="opacity-50" />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={toggleSettings}
            tooltip="Settings"
            className="px-4 py-2 hover:bg-primary/10"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </SidebarMenuButton>
          {showSettings && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={location.pathname === "/profile"}
                >
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 rounded-md transition-colors">
                    <UserCircle className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={location.pathname === "/my-plan"}
                >
                  <Link to="/my-plan" className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 rounded-md transition-colors">
                    <CreditCard className="h-4 w-4" />
                    <span>My Plan</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={location.pathname === "/help"}
                >
                  <Link to="/help" className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 rounded-md transition-colors">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={toggleTheme}
            tooltip="Toggle theme"
            className="px-4 py-2 hover:bg-primary/10"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </Footer>
  );
}