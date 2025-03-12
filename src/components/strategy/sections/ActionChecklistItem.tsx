
import { CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ActionChecklistItemProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const ActionChecklistItem = ({
  title,
  description,
  defaultChecked = false,
  onCheckedChange,
}: ActionChecklistItemProps) => {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  const handleCheckedChange = (value: boolean) => {
    setChecked(value);
    if (onCheckedChange) {
      onCheckedChange(value);
    }
  };

  return (
    <div className={cn(
      "p-5 rounded-xl transition-all duration-300 border",
      checked 
        ? "bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800/30" 
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Checkbox 
            checked={checked} 
            onCheckedChange={handleCheckedChange}
            className={cn(
              "h-5 w-5 rounded-md",
              checked 
                ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600" 
                : "border-slate-300 dark:border-slate-700"
            )}
          />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className={cn(
            "font-medium text-lg transition-colors",
            checked 
              ? "text-green-700 dark:text-green-400" 
              : "text-slate-900 dark:text-slate-100"
          )}>
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
        {checked && (
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 dark:text-green-400" />
        )}
      </div>
    </div>
  );
};
