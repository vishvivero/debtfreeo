
import { CurrencySelector } from "@/components/profile/CurrencySelector";
import { Calendar, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OverviewHeaderProps {
  currencySymbol: string;
  onCurrencyChange: (currency: string) => Promise<void>;
}

export const OverviewHeader = ({
  currencySymbol,
  onCurrencyChange,
}: OverviewHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-100">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Your Debt Overview
          </h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">View and manage your current debt situation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full sm:w-auto">
          <CurrencySelector
            value={currencySymbol}
            onValueChange={onCurrencyChange}
          />
        </div>
      </div>
    </div>
  );
};
