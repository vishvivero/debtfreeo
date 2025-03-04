
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Debt } from "@/lib/types/debt";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { CalculationResult } from "@/lib/utils/payment/standardizedCalculations";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

interface AmortizationTableProps {
  debt: Debt;
  amortizationData: CalculationResult[];
  currencySymbol: string;
  displayInitialBalance?: number;
}

export const AmortizationTable = ({ 
  debt, 
  amortizationData, 
  currencySymbol, 
  displayInitialBalance 
}: AmortizationTableProps) => {
  const [visibleRows, setVisibleRows] = useState(12); // Show first 12 months by default
  
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const remainingMonths = debt.metadata?.remaining_months;
  
  // Calculate principal for loans with interest included
  const calculatedPrincipal = isInterestIncluded && remainingMonths
    ? InterestCalculator.calculatePrincipalFromTotal(
        debt.balance,
        debt.interest_rate,
        debt.minimum_payment,
        remainingMonths
      )
    : null;

  // Starting balance for the amortization table should be the calculated principal, if applicable
  const initialBalance = displayInitialBalance || 
    (isInterestIncluded && calculatedPrincipal ? calculatedPrincipal : debt.balance);
  
  // If there's no amortization data, show a message
  if (!amortizationData || amortizationData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amortization Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to generate amortization schedule for this debt.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals for all payments, not just visible ones
  const totalInterest = amortizationData.reduce((sum, row) => sum + row.interestPayment, 0);
  const totalPrincipal = amortizationData.reduce((sum, row) => sum + row.principalPayment, 0);
  const totalPayments = amortizationData.reduce((sum, row) => sum + row.payment, 0);
  
  const loadMoreRows = () => {
    setVisibleRows(prevValue => prevValue + 12);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Amortization Schedule
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4 bg-white border rounded-lg shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Amortization Schedule</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    This schedule shows how each payment is applied to principal and interest, 
                    and how your balance decreases over time.
                  </p>
                  {isInterestIncluded && calculatedPrincipal !== null && (
                    <p className="text-sm text-blue-600">
                      Note: Since your loan includes pre-calculated interest, we're showing the amortization 
                      based on the calculated principal amount of {currencySymbol}{calculatedPrincipal.toLocaleString()}.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          
          <div className="text-sm font-medium text-gray-500">
            Total interest: {currencySymbol}{totalInterest.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Remaining Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-gray-50/50">
                <TableCell className="font-medium">Initial</TableCell>
                <TableCell>{format(new Date(), 'MMM yyyy')}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="font-medium">
                  {currencySymbol}{initialBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
              </TableRow>
              
              {amortizationData.slice(0, visibleRows).map((row, index) => (
                <TableRow key={index} className={row.remainingBalance <= 0 ? 'bg-green-50/50' : ''}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{format(row.date, 'MMM yyyy')}</TableCell>
                  <TableCell>{currencySymbol}{row.payment.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</TableCell>
                  <TableCell>{currencySymbol}{row.principalPayment.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</TableCell>
                  <TableCell>{currencySymbol}{row.interestPayment.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</TableCell>
                  <TableCell className="font-medium">
                    {row.remainingBalance <= 0 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Paid Off
                      </div>
                    ) : (
                      currencySymbol + row.remainingBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-primary-50 font-medium border-t-2 border-primary-100 sticky bottom-0">
              <TableRow>
                <TableCell colSpan={2} className="text-gray-700">TOTAL</TableCell>
                <TableCell className="text-gray-700">
                  {currencySymbol}{totalPayments.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-gray-700">
                  {currencySymbol}{totalPrincipal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-gray-700">
                  {currencySymbol}{totalInterest.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-gray-700">-</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        
        {visibleRows < amortizationData.length && (
          <div className="mt-4 text-center">
            <button 
              onClick={loadMoreRows} 
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Load more months
            </button>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-lg font-semibold">{currencySymbol}{totalPayments.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Interest</p>
              <p className="text-lg font-semibold">{currencySymbol}{totalInterest.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
