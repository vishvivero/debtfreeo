
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";

interface DebtCardProgressProps {
  progressPercentage: number;
  onViewDetails: (e: React.MouseEvent) => void;
  payoffTime: string;
}

export const DebtCardProgress = ({ 
  progressPercentage, 
  onViewDetails,
  payoffTime
}: DebtCardProgressProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-900">Progress</h4>
          <span className="text-sm font-medium text-gray-600">
            {progressPercentage}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Button 
        onClick={onViewDetails}
        className="w-full bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white flex items-center justify-center gap-2"
      >
        View Details
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-500">
          Standard repayment duration (without debt payoff strategy):
        </p>
        <p className="text-sm text-gray-600">
          {payoffTime}
        </p>
      </div>
    </div>
  );
};
