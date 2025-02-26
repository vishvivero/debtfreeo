
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet, RotateCw } from "lucide-react";
import { formatCurrency } from "@/lib/strategies";

interface PaymentOverviewSectionProps {
  totalMinimumPayments: number;
  extraPayment: number;
  onExtraPaymentChange: (amount: number) => void;
  onOpenExtraPaymentDialog: () => void;
  currencySymbol?: string;
  totalDebtValue: number;
}

export const PaymentOverviewSection = ({
  totalMinimumPayments,
  extraPayment,
  onExtraPaymentChange,
  onOpenExtraPaymentDialog,
  currencySymbol = "£",
  totalDebtValue,
}: PaymentOverviewSectionProps) => {
  console.log('PaymentOverviewSection render:', { extraPayment, totalMinimumPayments });

  const handleReset = () => {
    onExtraPaymentChange(0);
  };

  const handleExtraPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(value)) {
      const maxValue = totalDebtValue;
      onExtraPaymentChange(Math.min(Math.max(0, value), maxValue));
    }
  };

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Monthly Payments
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track and manage your monthly debt payments
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600">Minimum Payments</span>
            <span className="font-medium">
              {formatCurrency(totalMinimumPayments, currencySymbol)}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Extra Payment</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className={`text-xs ${extraPayment > 0 ? 'text-gray-500 hover:text-primary' : 'invisible'}`}
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </div>
              <Input
                type="number"
                min="0"
                step="any"
                value={extraPayment || ''}
                onChange={handleExtraPaymentChange}
                className="pl-7 pr-3 h-11 font-medium text-right bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:border-primary transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500">
              Maximum: {formatCurrency(totalDebtValue, currencySymbol)}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Monthly Payment</span>
              <span className="text-lg font-semibold text-primary">
                {formatCurrency(totalMinimumPayments + extraPayment, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
