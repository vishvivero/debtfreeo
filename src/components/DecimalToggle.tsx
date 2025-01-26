import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DecimalToggleProps {
  showDecimals: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
}

export const DecimalToggle = ({ showDecimals, onToggle, label = "Show decimals" }: DecimalToggleProps) => {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Switch
        id="show-decimals"
        checked={showDecimals}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="show-decimals">{label}</Label>
    </div>
  );
};