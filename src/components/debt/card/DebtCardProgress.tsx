
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, AlarmClock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Debt } from "@/lib/types/debt";

interface DebtCardProgressProps {
  debt: Debt;
  progressPercentage?: number;
  onViewDetails?: (e: React.MouseEvent) => void;
  payoffTime?: string;
  isMobile?: boolean;
}

export const DebtCardProgress = ({ 
  debt,
  progressPercentage = 0, 
  onViewDetails = () => {},
  payoffTime = "Unknown",
  isMobile = false
}: DebtCardProgressProps) => {
  return (
    <>
      {isMobile ? (
        // Mobile layout
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-medium text-gray-700">Progress</span>
            <div className="flex items-center gap-1 text-gray-500">
              <AlarmClock className="h-3 w-3" />
              <span>{payoffTime}</span>
              <span className="text-gray-600 ml-1">{progressPercentage}%</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-1.5 mb-2" />
          <Button 
            onClick={onViewDetails}
            size="sm"
            className="w-full bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white"
          >
            View Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      ) : (
        // Desktop layout
        <div className="flex items-center space-x-4">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="text-gray-600">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-gray-500 gap-1 min-w-max">
                  <AlarmClock className="h-3 w-3" />
                  <span className="whitespace-nowrap">{payoffTime}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Standard repayment duration without debt payoff strategy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            onClick={onViewDetails}
            size="sm"
            className="bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white"
          >
            Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
};
