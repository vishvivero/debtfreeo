
import { AmortizationEntry } from "@/lib/utils/payment/standardizedCalculations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Debt } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AmortizationTableProps {
  debt: Debt;
  amortizationData: AmortizationEntry[];
  currencySymbol: string;
}

export const AmortizationTable = ({ debt, amortizationData, currencySymbol }: AmortizationTableProps) => {
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const effectiveRate = isInterestIncluded ? (debt.metadata?.original_rate || 0) : debt.interest_rate;
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Amortization Schedule for {debt.name}</h2>
      
      {isInterestIncluded && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            This loan has pre-calculated interest included in the balance. 
            This amortization table shows a payment schedule using the original interest rate of {effectiveRate}% 
            and a back-calculated principal amount.
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
