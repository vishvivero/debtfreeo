
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { formatCurrency } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { Calendar, Clock4, CreditCard, PiggyBank } from "lucide-react";

interface PaymentCalculatorProps {
  debts: Debt[];
  totalMonthlyPayment: number;
  extraPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  currencySymbol?: string;
}

export const PaymentCalculator = ({
  debts,
  totalMonthlyPayment,
  extraPayment,
  strategy,
  oneTimeFundings,
  currencySymbol = "£"
}: PaymentCalculatorProps) => {
  const { timelineResults } = useDebtTimeline(
    debts,
    totalMonthlyPayment,
    strategy,
    oneTimeFundings
  );

  if (!timelineResults || debts.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Add debts to see payment calculations</p>
      </div>
    );
  }

  const { payoffDate, acceleratedMonths, baselineMonths, monthsSaved, interestSaved } = timelineResults;

  const metrics = [
    {
      label: "Payoff Date",
      value: payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: <Calendar className="h-4 w-4 text-emerald-500" />,
      description: "Estimated completion"
    },
    {
      label: "Time to Payoff",
      value: `${acceleratedMonths} months`,
      icon: <Clock4 className="h-4 w-4 text-blue-500" />,
      description: extraPayment > 0 ? `${monthsSaved} months saved` : "With current payments"
    },
    {
      label: "Interest Savings",
      value: formatCurrency(interestSaved, currencySymbol),
      icon: <PiggyBank className="h-4 w-4 text-indigo-500" />,
      description: extraPayment > 0 ? "From extra payments" : "Potential savings"
    },
    {
      label: "Monthly Payment",
      value: formatCurrency(totalMonthlyPayment, currencySymbol),
      icon: <CreditCard className="h-4 w-4 text-orange-500" />,
      description: extraPayment > 0 ? `${formatCurrency(extraPayment, currencySymbol)} extra` : "Required payment"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </div>
            <div className="text-right font-medium">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
