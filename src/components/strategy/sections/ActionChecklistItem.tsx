
import { CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ActionChecklistItemProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  comingSoon?: boolean;
}

export const ActionChecklistItem = ({
  title,
  description,
  defaultChecked = false,
  onCheckedChange,
  comingSoon = false,
}: ActionChecklistItemProps) => {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  const handleCheckedChange = (value: boolean) => {
    if (comingSoon) return;
    
    setChecked(value);
    if (onCheckedChange) {
      onCheckedChange(value);
    }
  };

  return (
    <div className={cn(
      "py-2.5 px-3 rounded-md transition-all duration-300 border",
      checked 
        ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800" 
        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
    )}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          <Checkbox 
            checked={checked} 
            onCheckedChange={handleCheckedChange}
            disabled={comingSoon}
            className={cn(
              "h-4 w-4 rounded-md",
              checked 
                ? "border-green-500 text-green-500" 
                : comingSoon
                  ? "border-slate-300 dark:border-slate-600 opacity-50"
                  : "border-slate-300 dark:border-slate-700"
            )}
          />
        </div>
        <div className="space-y-0.5 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className={cn(
              "font-medium text-sm transition-colors",
              checked 
                ? "text-slate-500 dark:text-slate-400" 
                : comingSoon 
                  ? "text-slate-500 dark:text-slate-500"
                  : "text-slate-800 dark:text-slate-100"
            )}>
              {title}
            </h3>
            {comingSoon && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                <span className="text-[10px] leading-none font-medium">Coming Soon</span>
              </Badge>
            )}
          </div>
          <p className={cn(
            "text-xs text-slate-600 dark:text-slate-400",
            comingSoon && "text-slate-400 dark:text-slate-500"
          )}>
            {description}
          </p>
        </div>
        {checked && !comingSoon && (
          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-500 dark:text-green-400" />
        )}
      </div>
    </div>
  );
};
