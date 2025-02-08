
import { Card } from "@/components/ui/card";
import { CreditCard, ArrowUpRight, LineChart } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { motion } from "framer-motion";

export const OverviewMetrics = () => {
  const { debts, profile, isLoading } = useDebts();
  
  const totalDebt = debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0;
  const monthlyPayment = profile?.monthly_payment || 0;
  const progress = totalDebt > 0 ? Math.round((monthlyPayment / totalDebt) * 100) : 0;
  
  const currencySymbol = profile?.preferred_currency || "$";

  const cards = [
    {
      title: "Total Debt",
      value: `${currencySymbol}${totalDebt.toLocaleString()}`,
      description: "Total amount owed across all debts",
      icon: CreditCard,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
      trendIndicator: totalDebt === 0 ? "positive" : "neutral"
    },
    {
      title: "Monthly Payment",
      value: `${currencySymbol}${monthlyPayment.toLocaleString()}`,
      description: "Your current monthly payment allocation",
      icon: ArrowUpRight,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      trendIndicator: monthlyPayment > 0 ? "positive" : "neutral"
    },
    {
      title: "Debt Payment Progress",
      value: `${progress}%`,
      description: "Ratio of monthly payment to total debt",
      icon: LineChart,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      trendIndicator: progress >= 10 ? "positive" : "neutral"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
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
          <Card className="p-6 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  {card.trendIndicator === "positive" && (
                    <span className="text-emerald-500 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                      ↑ Good
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                <p className="text-sm text-gray-500 max-w-[200px]">
                  {card.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor} group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
              <div 
                className={`h-full transition-all duration-500 ${
                  card.trendIndicator === "positive" ? "bg-emerald-500" : "bg-gray-300"
                }`}
                style={{
                  width: card.trendIndicator === "positive" ? "100%" : "0%"
                }}
              />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

