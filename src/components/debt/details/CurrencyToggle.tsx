
import { ToggleLeft, ToggleRight } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CurrencyToggleProps {
  useNativeCurrency: boolean;
  setUseNativeCurrency: (value: boolean) => void;
  debtCurrency: string;
  profileCurrency: string;
}

export const CurrencyToggle = ({ 
  useNativeCurrency, 
  setUseNativeCurrency, 
  debtCurrency, 
  profileCurrency 
}: CurrencyToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle 
            pressed={useNativeCurrency} 
            onPressedChange={setUseNativeCurrency}
            className="border rounded-md px-3 py-2 hover:bg-gray-100"
            aria-label="Toggle currency display"
          >
            {useNativeCurrency ? (
              <ToggleRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-gray-400" />
            )}
            <span className="ml-2 text-sm font-medium">
              {useNativeCurrency ? `Loan Currency (${debtCurrency})` : `Preferred Currency (${profileCurrency})`}
            </span>
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle between loan's native currency ({debtCurrency}) and your preferred currency ({profileCurrency})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
