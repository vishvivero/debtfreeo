
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
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
          Your Debt Overview
        </h1>
        <p className="text-gray-600">
          Track Your Progress Toward Financial Freedom
        </p>
      </div>
      <CurrencySelector
        value={currencySymbol}
        onValueChange={onCurrencyChange}
      />
    </div>
  );
};
