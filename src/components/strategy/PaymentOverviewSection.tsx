
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowRight, RotateCw, TrendingUp } from "lucide-react";
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
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Accelerate Your Debt Payoff
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add extra payments to reduce your debt faster and save on interest
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
            <div className="text-sm text-blue-600 mb-2">Required Monthly Payment</div>
            <div className="text-2xl font-semibold text-blue-700">
              {formatCurrency(totalMinimumPayments, currencySymbol)}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <div className="text-sm text-emerald-600 mb-2">Extra Monthly Payment</div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="number"
                  value={extraPayment || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const maxValue = totalDebtValue;
                    onExtraPaymentChange(Math.min(value, maxValue));
                  }}
                  max={totalDebtValue}
                  className="pl-9 text-emerald-600 font-medium"
                  placeholder="0"
                />
              </div>
              {extraPayment > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-10 w-10 rounded-full hover:bg-emerald-100/80"
                >
                  <RotateCw className="h-4 w-4 text-emerald-500" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Monthly Payment</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalMinimumPayments + extraPayment, currencySymbol)}
              </div>
            </div>
            <Button
              onClick={onOpenExtraPaymentDialog}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 w-full md:w-auto"
            >
              <span>Calculate Impact</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
