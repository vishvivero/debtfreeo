import { Payment } from "@/lib/types/payment";
import { format } from "date-fns";

interface PaymentScheduleProps {
  payments: Payment[];
  currencySymbol: string;
}

export const PaymentSchedule = ({ payments, currencySymbol }: PaymentScheduleProps) => {
  console.log('Rendering payment schedule with payments:', payments);

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
      {payments.map((payment, index) => (
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
                {currencySymbol}{payment.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <p className="text-xs text-gray-500">
                Balance: {currencySymbol}{payment.remainingBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              Principal: {currencySymbol}{payment.principalPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div>
              Interest: {currencySymbol}{payment.interestPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
          {payment.redistributedAmount > 0 && (
            <div className="mt-1 text-xs text-green-600">
              +{currencySymbol}{payment.redistributedAmount.toLocaleString()} redistributed
            </div>
          )}
        </div>
      ))}
    </div>
  );
};