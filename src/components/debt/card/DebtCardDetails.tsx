
import { Debt } from "@/lib/types/debt";
import { calculatePrincipal } from "../utils/debtPayoffCalculator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";

interface DebtCardDetailsProps {
  debt: Debt;
  showConvertedCurrency?: boolean;
}

export const DebtCardDetails = ({ 
  debt, 
  showConvertedCurrency = false 
}: DebtCardDetailsProps) => {
  const { preferredCurrency, getCurrencyDisplayInfo } = useCurrency();
  
  // Check if this is a debt with interest included
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const originalRate = debt.metadata?.original_rate || debt.interest_rate;
  
  // Calculate principal amount for display
  const calculatedPrincipal = calculatePrincipal(debt);
  
  // Determine what to display for balance
  const displayBalance = isInterestIncluded && calculatedPrincipal !== null 
    ? calculatedPrincipal 
    : debt.balance;

  // Determine what interest rate to display
  const displayInterestRate = isInterestIncluded ? originalRate : debt.interest_rate;
  
  // Get currency display information
  const balanceInfo = getCurrencyDisplayInfo(displayBalance, debt.currency_symbol);
  const paymentInfo = getCurrencyDisplayInfo(debt.minimum_payment, debt.currency_symbol);
  
  // Determine which currency to show (original or preferred)
  const showOriginalCurrency = !showConvertedCurrency || debt.currency_symbol === preferredCurrency;
  
  // Values to display
  const balanceToShow = showOriginalCurrency ? displayBalance : balanceInfo.convertedAmount;
  const currencyToShow = showOriginalCurrency ? debt.currency_symbol : preferredCurrency;
  const paymentToShow = showOriginalCurrency ? debt.minimum_payment : paymentInfo.convertedAmount;

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
          {currencyToShow}{balanceToShow.toLocaleString()}
        </p>
        {!showOriginalCurrency && (
          <p className="text-xs text-gray-500">
            Original: {debt.currency_symbol}{displayBalance.toLocaleString()}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-600">Monthly Payment</p>
        <p className="text-base font-semibold">
          {currencyToShow}{paymentToShow.toLocaleString()}
        </p>
        {!showOriginalCurrency && (
          <p className="text-xs text-gray-500">
            Original: {debt.currency_symbol}{debt.minimum_payment.toLocaleString()}
          </p>
        )}
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
