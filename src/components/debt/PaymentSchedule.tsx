
import { Payment } from "@/lib/types/payment";
import { format } from "date-fns";
import { useProfile } from "@/hooks/use-profile";
import { convertCurrency } from "@/lib/utils/currencyConverter";

interface PaymentScheduleProps {
  payments: Payment[];
  currencySymbol: string;
  usePreferredCurrency?: boolean;
}

export const PaymentSchedule = ({ 
  payments, 
  currencySymbol, 
  usePreferredCurrency = false 
}: PaymentScheduleProps) => {
  const { profile } = useProfile();
  const preferredCurrency = profile?.preferred_currency || "£";
  
  // Determine which currency symbol to display
  const displayCurrency = usePreferredCurrency ? preferredCurrency : currencySymbol;
  
  // Helper to convert currency if needed
  const convertAmount = (amount: number) => {
    if (!usePreferredCurrency || currencySymbol === preferredCurrency) {
      return amount;
    }
    return convertCurrency(amount, currencySymbol, preferredCurrency);
  };

  console.log('Rendering payment schedule with payments:', payments, {
    usePreferredCurrency,
    originalCurrency: currencySymbol,
    displayCurrency
  });

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
      {payments.map((payment, index) => {
        // Convert all monetary values if needed
        const displayAmount = convertAmount(payment.amount);
        const displayRemainingBalance = convertAmount(payment.remainingBalance);
        const displayPrincipalPaid = convertAmount(payment.principalPaid);
        const displayInterestPaid = convertAmount(payment.interestPaid);
        const displayRedistributedAmount = payment.redistributedAmount 
          ? convertAmount(payment.redistributedAmount) 
          : 0;
        
        return (
          <div 
            key={index}
            className={`p-3 rounded-lg ${
              payment.isLastPayment 
                ? "bg-green-50 border border-green-200" 
                : "bg-gray-50 border border-gray-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">
                  {format(payment.date, 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-gray-500">
                  Payment {index + 1}
                  {payment.isLastPayment && " (Final)"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {displayCurrency}{displayAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  Balance: {displayCurrency}{displayRemainingBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                Principal: {displayCurrency}{displayPrincipalPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <div>
                Interest: {displayCurrency}{displayInterestPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
            {displayRedistributedAmount > 0 && (
              <div className="mt-1 text-xs text-green-600">
                +{displayCurrency}{displayRedistributedAmount.toLocaleString()} redistributed
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
