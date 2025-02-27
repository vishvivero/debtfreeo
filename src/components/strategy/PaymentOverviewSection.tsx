import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight, RotateCw } from "lucide-react";
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
        <div className="space-y-2">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600">Minimum Payments</span>
            <span className="font-medium">
              {formatCurrency(totalMinimumPayments, currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600">Extra Payment</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="number"
                  value={extraPayment || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const maxValue = totalDebtValue;
                    onExtraPaymentChange(Math.min(value, maxValue));
                  }}
                  max={totalDebtValue}
                  className="w-32 pl-3 pr-10 text-left"
                />
                {extraPayment > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-gray-100"
                  >
                    <RotateCw className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={onOpenExtraPaymentDialog}
                className="text-primary hover:text-primary/90 min-w-[100px] text-center"
              >
                {formatCurrency(extraPayment, currencySymbol)}
              </Button>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="font-medium">Total Monthly Payment</span>
              <span className="font-medium text-primary">
                {formatCurrency(totalMinimumPayments + extraPayment, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};