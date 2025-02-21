
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { Strategy } from "@/lib/strategies";

interface StrategySectionProps {
  selectedStrategy: Strategy;
  onOpenStrategyDialog: () => void;
}

export const StrategySection = ({
  selectedStrategy,
  onOpenStrategyDialog,
}: StrategySectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Current Strategy</h3>
        <Button 
          variant="outline"
          onClick={onOpenStrategyDialog}
        >
          Change Strategy
        </Button>
      </div>
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">{selectedStrategy.name}</h4>
            <p className="text-sm text-muted-foreground">
              Add extra monthly payments to accelerate your debt payoff
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
