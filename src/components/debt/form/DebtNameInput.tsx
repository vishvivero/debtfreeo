
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

interface DebtNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const DebtNameInput = ({ value, onChange, disabled }: DebtNameInputProps) => {
  return (
    <div className="relative space-y-2">
      <Label className="text-sm font-medium text-gray-700">Debt Name</Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CreditCard className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 bg-white hover:border-primary/50 transition-colors"
          placeholder="Credit Card, Personal Loan, etc."
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
};
