
import { Check, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ActionChecklistItemProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
}

export const ActionChecklistItem = ({
  title,
  description,
  defaultChecked = false,
}: ActionChecklistItemProps) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-200",
      checked 
        ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" 
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Checkbox 
            checked={checked} 
            onCheckedChange={(value) => setChecked(!!value)}
            className={cn(
              "h-5 w-5 rounded-sm",
              checked && "bg-green-600 border-green-600 dark:bg-green-600 dark:border-green-600"
            )}
          />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className={cn(
            "font-medium text-slate-900 dark:text-slate-100 transition-colors",
            checked && "text-green-600 dark:text-green-400"
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
