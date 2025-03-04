
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StrategySelector } from "@/components/StrategySelector";
import { Strategy } from "@/lib/strategies";
import { strategies } from "@/lib/strategies";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";

interface StrategySelectionSectionProps {
  selectedStrategy: Strategy;
  onSelectStrategy: (strategy: Strategy) => void;
}

export const StrategySelectionSection = ({
  selectedStrategy,
  onSelectStrategy
}: StrategySelectionSectionProps) => {
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false);
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();

  const handleStrategyChange = async (strategy: Strategy) => {
    console.log('Changing strategy to:', strategy.id);
    
    if (strategy.id === selectedStrategy.id) {
      setIsStrategyDialogOpen(false);
      return; // Don't update if it's the same strategy
    }

    onSelectStrategy(strategy);
    
    if (profile) {
      try {
        await updateProfile.mutate({
          selected_strategy: strategy.id
        });
        toast({
          title: "Strategy Updated",
          description: `Your debt repayment strategy has been updated to ${strategy.name}`,
        });
      } catch (error) {
        console.error('Error updating strategy preference:', error);
        toast({
          title: "Error",
          description: "Failed to save strategy preference",
          variant: "destructive",
        });
      }
    }
    setIsStrategyDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Current Strategy</h3>
        <Button 
          variant="outline"
          onClick={() => setIsStrategyDialogOpen(true)}
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

      <Dialog open={isStrategyDialogOpen} onOpenChange={setIsStrategyDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Choose Your Strategy</h2>
            <StrategySelector
              strategies={strategies}
              selectedStrategy={selectedStrategy}
              onSelectStrategy={handleStrategyChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
