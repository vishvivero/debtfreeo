
import { Debt } from "@/lib/types/debt";
import { calculatePrincipal } from "../utils/debtPayoffCalculator";

interface DebtCardDetailsProps {
  debt: Debt;
}

export const DebtCardDetails = ({ debt }: DebtCardDetailsProps) => {
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

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div>
        <p className="text-gray-600 mb-1">Balance</p>
        <p className="text-2xl font-semibold">
          {debt.currency_symbol}{displayBalance.toLocaleString()}
        </p>
        {isInterestIncluded && calculatedPrincipal !== null && (
          <p className="text-xs text-blue-600">
            Principal only (interest excluded)
          </p>
        )}
      </div>
      <div>
        <p className="text-gray-600 mb-1">Monthly Payment</p>
        <p className="text-2xl font-semibold">
          {debt.currency_symbol}{debt.minimum_payment.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-gray-600 mb-1">APR</p>
        <p className="text-2xl font-semibold">
          {displayInterestRate}%
          {isInterestIncluded && (
            <span className="ml-2 text-xs font-normal text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
              Interest Included
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
