
import { useMemo } from "react";
import { useDebts } from "@/hooks/use-debts";
import { useDebtMetrics } from "@/hooks/use-debt-metrics";
import { DebtMetricsCard } from "./comparison/DebtMetricsCard";
import { CreditCard, ArrowUpRight, PiggyBank } from "lucide-react";

export const DebtOverview = () => {
  const { debts, profile } = useDebts();
  const metrics = useDebtMetrics(debts, profile?.monthly_payment);
  const currencySymbol = profile?.preferred_currency || "£";

  const formattedMetrics = useMemo(() => ({
    totalDebt: `${currencySymbol}${metrics.totalDebt.toLocaleString()}`,
    monthlyPayment: `${currencySymbol}${metrics.monthlyPayment.toLocaleString()}`,
    monthlyInterest: `${currencySymbol}${Math.round(metrics.totalMonthlyInterest).toLocaleString()}`
  }), [metrics, currencySymbol]);

  return (
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
  );
};
