
import { Strategy } from "@/lib/strategies";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
          advantage: "Fastest payoff and least interest",
          color: "from-emerald-500 to-teal-600",
          lightColor: "bg-emerald-50",
          iconColor: "text-emerald-500"
        };
      case "snowball":
        return {
          title: "Debt Snowball",
          subtitle: "Prioritize lowest balance first",
          advantage: "The most quick wins",
          color: "from-blue-500 to-indigo-600",
          lightColor: "bg-blue-50",
          iconColor: "text-blue-500"
        };
      default:
        return {
          title: "Balance Ratio",
          subtitle: "Balanced approach to debt repayment",
          advantage: "Best of both worlds",
          color: "from-purple-500 to-indigo-600",
          lightColor: "bg-purple-50",
          iconColor: "text-purple-500"
        };
    }
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
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Advantage</h4>
                    <p className="text-gray-600">{details.advantage}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-600">First debt paid off</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        2y 7m
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-600">All debts paid off</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        3y 9m
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-600">Interest saved</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        $74.77
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      </span>
                    </div>
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
