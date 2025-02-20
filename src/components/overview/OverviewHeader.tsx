
import { CurrencySelector } from "@/components/profile/CurrencySelector";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface OverviewHeaderProps {
  currencySymbol: string;
  onCurrencyChange: (currency: string) => void;
  onAddDebt?: () => void;
}

export const OverviewHeader = ({ currencySymbol, onCurrencyChange, onAddDebt }: OverviewHeaderProps) => {
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
        {onAddDebt && (
          <Button onClick={onAddDebt} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add debt
          </Button>
        )}
      </div>
    </div>
  );
};
