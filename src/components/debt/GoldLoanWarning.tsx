
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface GoldLoanWarningProps {
  principalAmount: number;
  currencySymbol: string;
  paymentDate: string;
}

export const GoldLoanWarning = ({ principalAmount, currencySymbol, paymentDate }: GoldLoanWarningProps) => {
  return (
    <Alert variant="warning" className="mt-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        <strong>Important Notice:</strong> This Gold Loan requires a final principal payment of {currencySymbol}
        {principalAmount.toLocaleString()} on {new Date(paymentDate).toLocaleDateString()}. Please ensure you plan for
        this large payment.
      </AlertDescription>
    </Alert>
  );
};
