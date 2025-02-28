
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCurrencies } from "@/lib/utils/currency-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { getExchangeRateUpdateDate } from "@/lib/utils/currencyConverter";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  showTooltip?: boolean;
  label?: string;
}

export function CurrencySelector({ 
  value, 
  onValueChange, 
  disabled,
  showTooltip = true,
  label = "Preferred Currency"
}: CurrencySelectorProps) {
  console.log('CurrencySelector - Current value:', value);
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {showTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  Exchange rates last updated: {getExchangeRateUpdateDate()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[280px] bg-white border-gray-200">
          <SelectValue placeholder="Select currency" />
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
