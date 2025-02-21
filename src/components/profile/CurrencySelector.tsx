
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCurrencies } from "@/lib/utils/currency-data";
import { Loader2 } from "lucide-react";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => Promise<void>;
  disabled?: boolean;
}

export function CurrencySelector({ value, onValueChange, disabled }: CurrencySelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  console.log('CurrencySelector - Current value:', value);
  
  const handleValueChange = async (newValue: string) => {
    setIsUpdating(true);
    try {
      await onValueChange(newValue);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Preferred Currency</p>
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger className="w-[280px] bg-white border-gray-200">
          <SelectValue placeholder="Select currency" />
          {isUpdating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-[300px]">
          {countryCurrencies.map((item) => (
            <SelectItem key={item.symbol} value={item.symbol}>
              <span className="flex items-center gap-2">
                <span className="font-medium">{item.symbol}</span>
                <span>{item.country} - {item.currency}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
