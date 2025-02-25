
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { format, differenceInMonths } from "date-fns";
import { Card } from "@/components/ui/card";

interface GoldLoanWarningProps {
  principalAmount: number;
  currencySymbol: string;
  paymentDate: string;
  monthlyInterest: number;
}

export const GoldLoanWarning = ({ 
  principalAmount, 
  currencySymbol, 
  paymentDate,
  monthlyInterest
}: GoldLoanWarningProps) => {
  const now = new Date();
  const dueDate = new Date(paymentDate);
  const monthsRemaining = Math.max(0, differenceInMonths(dueDate, now));

  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800 font-semibold">
          Gold Loan Payment Schedule
        </AlertTitle>
        <AlertDescription className="text-amber-700 mt-2">
          This is a gold-backed loan with specific payment requirements. Please review the payment schedule carefully.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 bg-white shadow-sm border-amber-200">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-amber-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Monthly Interest Payments</p>
              <p className="text-sm text-gray-600 mt-1">
                You must pay {currencySymbol}{monthlyInterest.toLocaleString()} in interest each month
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Missing interest payments may result in penalties
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm border-amber-200">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-amber-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Final Principal Payment</p>
              <p className="text-sm text-gray-600 mt-1">
                {currencySymbol}{principalAmount.toLocaleString()} due on {format(dueDate, 'MMM dd, yyyy')}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                {monthsRemaining} months until principal payment is due
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-700">
          <span className="font-semibold">Total Cost Breakdown:</span>
          <ul className="mt-2 space-y-1">
            <li>• Monthly Interest: {currencySymbol}{monthlyInterest.toLocaleString()}</li>
            <li>• Total Interest (over {monthsRemaining} months): {currencySymbol}{(monthlyInterest * monthsRemaining).toLocaleString()}</li>
            <li>• Principal Amount: {currencySymbol}{principalAmount.toLocaleString()}</li>
            <li className="font-semibold">• Total Cost: {currencySymbol}{(monthlyInterest * monthsRemaining + principalAmount).toLocaleString()}</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
