
import { CurrencySelector } from "@/components/profile/CurrencySelector";
import { Calendar } from "lucide-react";
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
          <Calendar className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Your Debt Overview
          </h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">View and manage your current debt situation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full sm:w-auto mt-2">
          <CurrencySelector
            value={currencySymbol}
            onValueChange={onCurrencyChange}
          />
        </div>
      </div>
    </div>
  );
};
