
import { AmortizationEntry } from "@/lib/utils/payment/standardizedCalculations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Debt } from "@/lib/types";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

interface AmortizationTableProps {
  debt: {
    name: string;
    balance?: number;
    interest_rate?: number;
    minimum_payment?: number;
    metadata?: {
      interest_included?: boolean;
      remaining_months?: number;
      original_rate?: number;
    };
  };
  amortizationData: AmortizationEntry[];
  currencySymbol: string;
}

export const AmortizationTable = ({ debt, amortizationData, currencySymbol }: AmortizationTableProps) => {
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const originalRate = debt.metadata?.original_rate || debt.interest_rate || 0;
  const remainingMonths = debt.metadata?.remaining_months || 0;
  
  let originalPrincipal = debt.balance || 0;
  let totalInterest = 0;
  
  // Calculate the original principal amount if interest is included
  if (isInterestIncluded && debt.balance && debt.minimum_payment && remainingMonths) {
    originalPrincipal = InterestCalculator.calculatePrincipalFromTotal(
      debt.balance,
      originalRate,
      debt.minimum_payment,
      remainingMonths
    );
    
    // Calculate total interest
    totalInterest = (debt.minimum_payment * remainingMonths) - originalPrincipal;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Amortization Schedule for {debt.name}</h2>
      
      {isInterestIncluded && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700 font-medium">Interest Already Included</AlertTitle>
          <AlertDescription className="text-blue-700">
            <div className="mt-2 space-y-2">
              <p>
                This loan has pre-calculated interest included in the balance. Below is the breakdown:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div className="font-medium">Total with Interest:</div>
                <div>{currencySymbol}{debt.balance?.toFixed(2)}</div>
                
                <div className="font-medium">Original Principal:</div>
                <div>{currencySymbol}{originalPrincipal.toFixed(2)}</div>
                
                <div className="font-medium">Total Interest:</div>
                <div>{currencySymbol}{totalInterest.toFixed(2)}</div>
                
                <div className="font-medium">Interest Rate:</div>
                <div>{originalRate}%</div>
                
                <div className="font-medium">Monthly Payment:</div>
                <div>{currencySymbol}{debt.minimum_payment?.toFixed(2)}</div>
                
                <div className="font-medium">Remaining Months:</div>
                <div>{remainingMonths}</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Remaining Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {amortizationData.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{format(entry.date, 'MMM d, yyyy')}</TableCell>
                <TableCell>{currencySymbol}{entry.payment.toFixed(2)}</TableCell>
                <TableCell>{currencySymbol}{entry.principal.toFixed(2)}</TableCell>
                <TableCell>{currencySymbol}{entry.interest.toFixed(2)}</TableCell>
                <TableCell>{currencySymbol}{entry.remainingBalance.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
