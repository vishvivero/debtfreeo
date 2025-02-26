
import { useMemo } from "react";
import { useDebts } from "@/hooks/use-debts";
import { useDebtMetrics } from "@/hooks/use-debt-metrics";
import { DebtMetricsCard } from "./comparison/DebtMetricsCard";
import { ProgressBar } from "./comparison/ProgressBar";
import { TimeframeDisplay } from "./comparison/TimeframeDisplay";
import { ActionPlan } from "./ActionPlan";
import { Card } from "@/components/ui/card";
import { CreditCard, ArrowUpRight, LineChart, PiggyBank } from "lucide-react";

export const DebtOverview = () => {
  const { debts, profile } = useDebts();
  const metrics = useDebtMetrics(debts, profile?.monthly_payment);
  const currencySymbol = profile?.preferred_currency || "£";

  const formattedMetrics = useMemo(() => ({
    totalDebt: `${currencySymbol}${metrics.totalDebt.toLocaleString()}`,
    monthlyPayment: `${currencySymbol}${metrics.monthlyPayment.toLocaleString()}`,
    monthlyInterest: `${currencySymbol}${Math.round(metrics.totalMonthlyInterest).toLocaleString()}`
  }), [metrics, currencySymbol]);

  // Calculate highest APR debt and lowest balance debt
  const highestAprDebt = useMemo(() => {
    if (!debts?.length) return undefined;
    const debt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    return {
      name: debt.name,
      apr: debt.interest_rate
    };
  }, [debts]);

  const lowestBalanceDebt = useMemo(() => {
    if (!debts?.length) return undefined;
    const debt = [...debts].sort((a, b) => a.balance - b.balance)[0];
    return {
      name: debt.name,
      balance: debt.balance
    };
  }, [debts]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DebtMetricsCard
          title="Total Debt"
          value={formattedMetrics.totalDebt}
          icon={<CreditCard className="w-5 h-5 text-emerald-500" />}
          info="Your current total debt across all accounts"
          delay={0.1}
        />
        <DebtMetricsCard
          title="Monthly Payment"
          value={formattedMetrics.monthlyPayment}
          icon={<ArrowUpRight className="w-5 h-5 text-blue-500" />}
          info="Your total monthly debt payment"
          delay={0.2}
        />
        <DebtMetricsCard
          title="Monthly Interest"
          value={formattedMetrics.monthlyInterest}
          icon={<PiggyBank className="w-5 h-5 text-purple-500" />}
          info="Interest paid per month across all debts"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Breakdown</h3>
          <div className="space-y-4">
            <ProgressBar
              percentage={metrics.principalPercentage}
              color="text-emerald-500"
              label="Principal"
              value={`${Math.round(metrics.principalPercentage)}%`}
            />
            <ProgressBar
              percentage={metrics.interestPercentage}
              color="text-red-500"
              label="Interest"
              value={`${Math.round(metrics.interestPercentage)}%`}
            />
          </div>
        </Card>

        <ActionPlan
          highestAprDebt={highestAprDebt}
          lowestBalanceDebt={lowestBalanceDebt}
          monthlyInterest={metrics.totalMonthlyInterest}
          optimizationScore={0}
          currencySymbol={currencySymbol}
        />
      </div>

      <TimeframeDisplay
        years={metrics.baselineYears}
        months={metrics.baselineMonths}
        label="Estimated Time to Debt Freedom"
        className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm"
      />
    </div>
  );
};
