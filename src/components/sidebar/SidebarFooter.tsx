
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function SidebarFooter() {
  const navigate = useNavigate();
  
  return (
    <div className="flex-shrink-0 p-4 border-t border-border/50 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/profile")}
        className="rounded-full"
      >
        <Settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button>
      <ThemeToggle />
    </div>
  );
}
