
import { PiggyBank, Info, Plane, Smartphone, Palmtree } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SavingsSectionProps {
  comparison: {
    moneySaved: number;
  };
}

export const SavingsSection = ({ comparison }: SavingsSectionProps) => {
  return (
    <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
          <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">With your savings, you could get</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
              >
                Real-world examples of what you could do with your savings.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Plane className="w-4 h-4 text-emerald-600" /> International Trips
            </span>
            <span className="font-semibold text-emerald-600">
              {Math.floor(comparison.moneySaved / 1000)} trips
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Premium Smartphones
            </span>
            <span className="font-semibold text-emerald-600">
              {Math.floor(comparison.moneySaved / 800)} phones
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-emerald-600" /> Dream Family Vacation
            </span>
            <span className="font-semibold text-emerald-600">
              1 trip
            </span>
          </div>
        </div>
        <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
          Make your savings work for you!
        </div>
      </div>
    </div>
  );
};
