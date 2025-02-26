
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowUpRight, LineChart } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { motion } from "framer-motion";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";

export const OverviewMetrics = () => {
  const { debts, profile, isLoading } = useDebts();
  
  // Memoize calculations to prevent unnecessary recalculations
  const metrics = useMemo(() => {
    if (!debts) return { totalDebt: 0, monthlyPayment: 0, progress: 0 };
    
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const monthlyPayment = profile?.monthly_payment || 0;
    const progress = totalDebt > 0 ? Math.round((monthlyPayment / totalDebt) * 100) : 0;
    
    console.log('Calculated metrics:', { totalDebt, monthlyPayment, progress });
    return { totalDebt, monthlyPayment, progress };
  }, [debts, profile?.monthly_payment]);
  
  const currencySymbol = profile?.preferred_currency || "$";

  const cards = useMemo(() => [
    {
      title: "Total Debt",
      value: `${currencySymbol}${metrics.totalDebt.toLocaleString()}`,
      icon: CreditCard,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500"
    },
    {
      title: "Monthly Payment",
      value: `${currencySymbol}${metrics.monthlyPayment.toLocaleString()}`,
      icon: ArrowUpRight,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      title: "Debt Payment Progress",
      value: `${metrics.progress}%`,
      icon: LineChart,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500"
    }
  ], [currencySymbol, metrics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!debts || debts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
