
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      icon: CreditCard,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500"
    },
    {
      title: "Monthly Payment",
      value: `${currencySymbol}${monthlyPayment.toLocaleString()}`,
      icon: ArrowUpRight,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      title: "Debt Payment Progress",
      value: "Coming Soon",
      icon: LineChart,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      comingSoon: true
    }
  ];

  if (isLoading) {
    return <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />;
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
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                {card.comingSoon && (
                  <Badge 
                    variant="secondary" 
                    className="text-purple-700"
                  >
                    Coming Soon
                  </Badge>
                )}
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
