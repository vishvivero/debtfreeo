
import { CurrencySelector } from "@/components/profile/CurrencySelector";

interface OverviewHeaderProps {
  currencySymbol: string;
  onCurrencyChange: (currency: string) => void;
}

export const OverviewHeader = ({ currencySymbol, onCurrencyChange }: OverviewHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600">Track your debt payoff journey</p>
      </div>
      <div className="flex items-center gap-4">
        <CurrencySelector
          value={currencySymbol}
          onValueChange={onCurrencyChange}
        />
      </div>
    </div>
  );
};
