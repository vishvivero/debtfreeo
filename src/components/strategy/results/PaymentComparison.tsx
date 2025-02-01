import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { Strategy } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OneTimeFunding } from "@/hooks/types";

interface PaymentComparisonProps {
  debts: Debt[];
  monthlyPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  currencySymbol?: string;
}

export const PaymentComparison = ({
  debts,
  monthlyPayment,
  strategy,
  oneTimeFundings,
  currencySymbol = '£'
}: PaymentComparisonProps) => {
  console.log('🔄 Starting payment comparison calculation:', {
    debtsCount: debts.length,
    totalDebt: debts.reduce((sum, debt) => sum + debt.balance, 0),
    monthlyPayment,
    strategy: strategy.name,
    oneTimeFundings
  });

  const { timelineResults } = useDebtTimeline({
    debts,
    monthlyPayment,
    strategy,
    oneTimeFundings
  });

  if (!timelineResults) {
    console.log('No timeline results available');
    return null;
  }

  const {
    baselineMonths,
    acceleratedMonths,
    totalBaselineInterest,
    totalAcceleratedInterest
  } = timelineResults;

  const monthsSaved = Math.max(0, baselineMonths - acceleratedMonths);
  const interestSaved = Math.max(0, totalBaselineInterest - totalAcceleratedInterest);
  const percentageSaved = (interestSaved / totalBaselineInterest) * 100;

  console.log('Timeline calculation results:', {
    baselineMonths,
    acceleratedMonths,
    monthsSaved,
    totalBaselineInterest,
    totalAcceleratedInterest,
    interestSaved,
    percentageSaved
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Without DebtFreeo</h4>
                <p className="text-2xl font-bold">
                  {currencySymbol}{totalBaselineInterest.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Interest ({baselineMonths} months)
                </p>
              </div>
              <Progress value={100} className="w-[60px]" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">With DebtFreeo</h4>
                <p className="text-2xl font-bold text-primary">
                  {currencySymbol}{totalAcceleratedInterest.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Interest ({acceleratedMonths} months)
                </p>
              </div>
              <Progress 
                value={Math.min(100, (totalAcceleratedInterest / totalBaselineInterest) * 100)} 
                className="w-[60px]" 
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interest Saved</span>
                <span className="font-medium">
                  {currencySymbol}{interestSaved.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Time Saved</span>
                <span className="font-medium">{monthsSaved} months</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};