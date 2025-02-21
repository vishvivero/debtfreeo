
import { CurrencySelector } from "@/components/profile/CurrencySelector";

interface OverviewHeaderProps {
  currencySymbol: string;
  onCurrencyChange: (currency: string) => void;
}

export const OverviewHeader = ({
  currencySymbol,
  onCurrencyChange,
}: OverviewHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          <span className="text-emerald-600">Your Financial</span>{" "}
          <span className="text-blue-600">Overview</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Track and optimize your journey to financial freedom
        </p>
      </div>
      <div>
        <CurrencySelector
          value={currencySymbol}
          onValueChange={onCurrencyChange}
        />
      </div>
    </div>
  );
};
