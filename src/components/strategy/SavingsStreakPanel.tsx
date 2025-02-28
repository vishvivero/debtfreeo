import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { formatCurrency } from "@/lib/strategies";

interface SavingsStreakPanelProps {
  extraPayment: number;
  oneTimeFundingTotal?: number;
  currencySymbol?: string;
}

export const SavingsStreakPanel = ({
  extraPayment,
  oneTimeFundingTotal = 0,
  currencySymbol = "£"
}: SavingsStreakPanelProps) => {
  const totalSavings = extraPayment + oneTimeFundingTotal;

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Savings Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Extra Payments</span>
            <span className="font-medium text-primary">
              {formatCurrency(extraPayment, currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">One-time Funding</span>
            <span className="font-medium text-primary">
              {formatCurrency(oneTimeFundingTotal, currencySymbol)}
            </span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Savings</span>
              <span className="font-medium text-primary">
                {formatCurrency(totalSavings, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};