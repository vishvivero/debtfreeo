
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowUpRight, LineChart } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { motion } from "framer-motion";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import { calculatePrincipal } from "@/components/debt/utils/debtPayoffCalculator";
import { convertCurrency } from "@/lib/utils/currencyConverter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export const OverviewMetrics = () => {
  const { debts, profile, isLoading } = useDebts();
  
  const preferredCurrency = profile?.preferred_currency || "$";
  
  // Calculate total debt with currency conversion
  const totalDebt = debts?.reduce((sum, debt) => {
    let debtAmount = debt.balance;
    
    // If interest is included, use principal amount
    if (debt.metadata?.interest_included) {
      const principal = calculatePrincipal(debt);
      debtAmount = principal !== null ? principal : debt.balance;
    }
    
    // Convert to preferred currency if needed
    const convertedAmount = convertCurrency(
      debtAmount,
      debt.currency_symbol,
      preferredCurrency
    );
    
    return sum + convertedAmount;
  }, 0) || 0;
  
  // Calculate total monthly payment with currency conversion
  const totalMonthlyPayment = debts?.reduce((sum, debt) => {
    // Convert to preferred currency if needed
    const convertedAmount = convertCurrency(
      debt.minimum_payment,
      debt.currency_symbol,
      preferredCurrency
    );
    
    return sum + convertedAmount;
  }, 0) || 0;
  
  const progress = totalDebt > 0 ? Math.round((totalMonthlyPayment / totalDebt) * 100) : 0;

  console.log('Monthly payment calculations:', {
    preferredCurrency,
    totalMonthlyPayment,
    payments: debts?.map(d => ({
      name: d.name,
      original: `${d.currency_symbol}${d.minimum_payment}`,
      converted: `${preferredCurrency}${convertCurrency(
        d.minimum_payment,
        d.currency_symbol,
        preferredCurrency
      )}`
    }))
  });

  const cards = [
    {
      title: "Total Debt",
      value: `${preferredCurrency}${totalDebt.toLocaleString()}`,
      icon: CreditCard,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
      hasTooltip: true,
      tooltipContent: "Total debt converted to your preferred currency"
    },
    {
      title: "Monthly Payment",
      value: `${preferredCurrency}${totalMonthlyPayment.toLocaleString()}`,
      icon: ArrowUpRight,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      hasTooltip: true,
      tooltipContent: "Total minimum payments converted to your preferred currency"
    },
    {
      title: "Debt Payment Progress",
      value: "Coming Soon",
      icon: LineChart,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      hasTooltip: false
    }
  ];

  if (isLoading) {
    return <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />;
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
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">{card.value}</p>
                  {card.hasTooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="bg-gray-100 rounded-full p-1 flex items-center justify-center">
                            <InfoIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border shadow-md p-2">
                          <p className="text-sm">{card.tooltipContent}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
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
