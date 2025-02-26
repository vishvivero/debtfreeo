
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
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold">
          <span className="text-emerald-600">Your Financial</span>{" "}
          <span className="text-blue-600">Overview</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
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
