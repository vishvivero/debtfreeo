
import { Debt } from "@/lib/types/debt";
import { calculatePrincipal } from "../utils/debtPayoffCalculator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { convertCurrency } from "@/lib/utils/currencyConverter";

interface DebtCardDetailsProps {
  debt: Debt;
  usePreferredCurrency?: boolean;
}

export const DebtCardDetails = ({ debt, usePreferredCurrency = false }: DebtCardDetailsProps) => {
  const { profile } = useProfile();
  const preferredCurrency = profile?.preferred_currency || "£";
  
  // Check if this is a debt with interest included
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const originalRate = debt.metadata?.original_rate || debt.interest_rate;
  
  // Calculate principal amount for display
  const calculatedPrincipal = calculatePrincipal(debt);
  
  // Determine what to display for balance
  let displayBalance = isInterestIncluded && calculatedPrincipal !== null 
    ? calculatedPrincipal 
    : debt.balance;
  
  // Determine which currency to use
  const displayCurrency = usePreferredCurrency ? preferredCurrency : debt.currency_symbol;
  
  // Convert values if using preferred currency
  if (usePreferredCurrency && debt.currency_symbol !== preferredCurrency) {
    displayBalance = convertCurrency(displayBalance, debt.currency_symbol, preferredCurrency);
  }
  
  // Convert minimum payment if needed
  const displayMinimumPayment = usePreferredCurrency && debt.currency_symbol !== preferredCurrency
    ? convertCurrency(debt.minimum_payment, debt.currency_symbol, preferredCurrency)
    : debt.minimum_payment;

  // Determine what interest rate to display
  const displayInterestRate = isInterestIncluded ? originalRate : debt.interest_rate;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-600">Balance</p>
          {isInterestIncluded && calculatedPrincipal !== null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Principal only (interest excluded)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-base font-semibold">
          {displayCurrency}{displayBalance.toLocaleString()}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-600">Monthly Payment</p>
        <p className="text-base font-semibold">
          {displayCurrency}{displayMinimumPayment.toLocaleString()}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-600">APR</p>
        <div className="flex items-center gap-1.5">
          <p className="text-base font-semibold">
            {displayInterestRate}%
          </p>
          {isInterestIncluded && (
            <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Interest Included
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
