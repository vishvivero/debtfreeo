
import { CurrencySelector } from "@/components/profile/CurrencySelector";

interface OverviewHeaderProps {
  currencySymbol: string;
  onCurrencyChange: (currency: string) => Promise<void>;
}

export const OverviewHeader = ({
  currencySymbol,
  onCurrencyChange,
}: OverviewHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Your Debt Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Track and optimize your journey to financial freedom
        </p>
      </div>
      <div className="w-full sm:w-auto">
        <CurrencySelector
          value={currencySymbol}
          onValueChange={onCurrencyChange}
        />
      </div>
    </div>
  );
};
