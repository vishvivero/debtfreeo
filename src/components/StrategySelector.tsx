import { Strategy } from "@/lib/strategies";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Wallet, ArrowUpDown } from "lucide-react";

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
  console.log('StrategySelector props:', { strategies, selectedStrategy }); // Debug log

  const getStrategyIcon = (id: string) => {
    switch (id) {
      case "avalanche":
        return <ArrowUpDown className="h-5 w-5" />;
      case "snowball":
        return <Target className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  if (!strategies || strategies.length === 0) {
    console.warn('No strategies provided to StrategySelector');
    return null;
  }

  return (
    <div className="space-y-3 w-full">
      {strategies.map((strategy, index) => (
        <motion.div
          key={strategy.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant={selectedStrategy.id === strategy.id ? "default" : "outline"}
            className={`w-full justify-between h-auto py-4 px-6 relative ${
              selectedStrategy.id === strategy.id 
                ? "bg-primary text-primary-foreground"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelectStrategy(strategy)}
          >
            <div className="flex items-start gap-4 w-full min-w-0">
              <div className={`p-2 rounded-full shrink-0 ${
                selectedStrategy.id === strategy.id 
                  ? "bg-primary-foreground/10" 
                  : "bg-primary/10"
              }`}>
                {getStrategyIcon(strategy.id)}
              </div>
              
              <div className="flex-1 text-left space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold break-words">{strategy.name}</span>
                  {index === 1 && (
                    <Badge 
                      variant="secondary" 
                      className={`${
                        selectedStrategy.id === strategy.id
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      } whitespace-nowrap`}
                    >
                      Our Pick
                    </Badge>
                  )}
                </div>
                <p className={`text-sm break-words ${
                  selectedStrategy.id === strategy.id 
                    ? "text-primary-foreground/90"
                    : "text-muted-foreground"
                }`}>
                  {strategy.description}
                </p>
              </div>
              
              <ArrowRight className={`h-5 w-5 shrink-0 ${
                selectedStrategy.id === strategy.id 
                  ? "text-primary-foreground"
                  : "text-primary"
              }`} />
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};