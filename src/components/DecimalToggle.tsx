import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";

interface DecimalToggleProps {
  showDecimals: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
  resetOnDisable?: boolean;
}

export const DecimalToggle = ({ 
  showDecimals, 
  onToggle, 
  label = "Add Extra Payments",
  resetOnDisable = false
}: DecimalToggleProps) => {
  const { toast } = useToast();
  const { resetMonthlyPayment } = useMonthlyPayment();

  const handleToggle = async (checked: boolean) => {
    if (!checked && resetOnDisable) {
      await resetMonthlyPayment();
      toast({
        title: "Extra payments reset",
        description: "Your extra payment amount has been reset to 0",
      });
    }
    onToggle(checked);
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Switch
        id="show-decimals"
        checked={showDecimals}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="show-decimals">{label}</Label>
    </div>
  );
};