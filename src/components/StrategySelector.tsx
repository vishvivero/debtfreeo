import { Strategy } from "@/lib/strategies";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Target, DollarSign } from "lucide-react";

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

  const getStrategyIcon = (id: string) => {
    switch (id) {
      case "avalanche":
        return <DollarSign className="h-12 w-12 text-primary" />;
      case "snowball":
        return <Target className="h-12 w-12 text-primary" />;
      default:
        return <Target className="h-12 w-12 text-primary" />;
    }
  };

  const getStrategyDetails = (id: string) => {
    switch (id) {
      case "avalanche":
        return {
          title: "Debt Avalanche",
          subtitle: "Prioritize highest interest rate",
          advantage: "Fastest payoff and least interest",
        };
      case "snowball":
        return {
          title: "Debt Snowball",
          subtitle: "Prioritize lowest balance first",
          advantage: "The most quick wins",
        };
      default:
        return {
          title: "Balance Ratio",
          subtitle: "Balanced approach to debt repayment",
          advantage: "Best of both worlds",
        };
    }
  };

  if (!strategies || strategies.length === 0) {
    console.warn('No strategies provided to StrategySelector');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.slice(0, 2).map((strategy, index) => {
          const details = getStrategyDetails(strategy.id);
          const isSelected = selectedStrategy.id === strategy.id;
          
          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border bg-white p-6 ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  {getStrategyIcon(strategy.id)}
                  <h3 className="text-xl font-semibold text-gray-900">{details.title}</h3>
                  <p className="text-gray-500">{details.subtitle}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Advantage</h4>
                    <p className="text-gray-600">{details.advantage}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time to first debt paid off</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        2 years 7 months
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time to all debts paid off</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        3 years 9 months
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Interest saved</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        $74.77
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={isSelected ? "secondary" : "default"}
                    className="w-full"
                    onClick={() => onSelectStrategy(strategy)}
                  >
                    {isSelected ? "Selected" : "Select"}
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
