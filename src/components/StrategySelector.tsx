
import { Strategy } from "@/lib/strategies";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Target, DollarSign } from "lucide-react";
import { useDebtCalculation } from "@/contexts/DebtCalculationContext";
import { useDebts } from "@/hooks/use-debts";
import { formatCurrency } from "@/lib/strategies";
import { format, addMonths } from "date-fns";

interface StrategySelectorProps {
  strategies: Strategy[];
  selectedStrategy: Strategy;
  onSelectStrategy: (strategy: Strategy) => void;
}

export const StrategySelector = ({
  strategies = [],
  selectedStrategy,
  onSelectStrategy,
}: StrategySelectorProps) => {
  console.log('StrategySelector props:', { strategies, selectedStrategy });
  
  const { debts } = useDebts();
  const { calculateTimeline } = useDebtCalculation();

  const getStrategyIcon = (id: string) => {
    switch (id) {
      case "avalanche":
        return <DollarSign className="h-12 w-12" />;
      case "snowball":
        return <Target className="h-12 w-12" />;
      default:
        return <Target className="h-12 w-12" />;
    }
  };

  const getStrategyDetails = (id: string) => {
    switch (id) {
      case "avalanche":
        return {
          title: "Debt Avalanche",
          subtitle: "Prioritize highest interest rate",
          color: "from-emerald-500 to-teal-600",
          lightColor: "bg-emerald-50",
          iconColor: "text-emerald-500"
        };
      case "snowball":
        return {
          title: "Debt Snowball",
          subtitle: "Prioritize lowest balance first",
          color: "from-blue-500 to-indigo-600",
          lightColor: "bg-blue-50",
          iconColor: "text-blue-500"
        };
      default:
        return {
          title: "Balance Ratio",
          subtitle: "Balanced approach to debt repayment",
          color: "from-purple-500 to-indigo-600",
          lightColor: "bg-purple-50",
          iconColor: "text-purple-500"
        };
    }
  };

  const getStrategyMetrics = (strategy: Strategy) => {
    if (!debts || debts.length === 0) return null;
    
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    const results = calculateTimeline(debts, totalMinimumPayment, strategy, []);

    const formatMonths = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years}y ${remainingMonths}m`;
    };

    return {
      firstDebtPaidOff: formatMonths(Math.ceil(results.acceleratedMonths / 2)),
      allDebtsPaidOff: formatMonths(results.acceleratedMonths),
      interestSaved: formatCurrency(results.interestSaved, debts[0]?.currency_symbol || '£')
    };
  };

  if (!strategies || strategies.length === 0) {
    console.warn('No strategies provided to StrategySelector');
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {strategies.slice(0, 2).map((strategy, index) => {
          const details = getStrategyDetails(strategy.id);
          const metrics = getStrategyMetrics(strategy);
          const isSelected = selectedStrategy.id === strategy.id;
          
          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
              } transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${details.color} opacity-[0.08]`} />
              
              <div className="relative p-8 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-2xl ${details.lightColor}`}>
                    <div className={details.iconColor}>
                      {getStrategyIcon(strategy.id)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{details.title}</h3>
                    <p className="mt-2 text-gray-600">{details.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    {metrics && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm text-gray-600">First debt paid off</span>
                          <span className="text-sm font-medium text-gray-900">
                            {metrics.firstDebtPaidOff}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm text-gray-600">All debts paid off</span>
                          <span className="text-sm font-medium text-gray-900">
                            {metrics.allDebtsPaidOff}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm text-gray-600">Interest saved</span>
                          <span className="text-sm font-medium text-gray-900">
                            {metrics.interestSaved}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    variant={isSelected ? "secondary" : "default"}
                    className={`w-full ${
                      isSelected 
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' 
                        : `bg-gradient-to-r ${details.color} text-white hover:opacity-90`
                    }`}
                    onClick={() => onSelectStrategy(strategy)}
                  >
                    {isSelected ? "Currently Selected" : "Choose This Strategy"}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
