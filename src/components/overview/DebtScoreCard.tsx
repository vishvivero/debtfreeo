import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const DebtScoreCard = () => {
  return (
    <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-emerald-100">
          <Award className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          What Debtfreeo Can Save You
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">See how much you could save with our optimized strategy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
    </div>
  );
};
