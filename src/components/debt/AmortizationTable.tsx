import { useState } from "react";
import { Debt } from "@/lib/types/debt";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Table as TableIcon } from "lucide-react";

interface AmortizationTableProps {
  debt: Debt;
  amortizationData: Array<{
    date: Date;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }>;
  currencySymbol: string;
}

export const AmortizationTable = ({ debt, amortizationData, currencySymbol }: AmortizationTableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleData = isExpanded ? amortizationData : amortizationData.slice(0, 3);
  
  // Calculate totals with safe number conversion
  const totals = amortizationData.reduce((acc, row) => ({
    payment: acc.payment + (Number(row.payment) || 0),
    principal: acc.principal + (Number(row.principal) || 0),
    interest: acc.interest + (Number(row.interest) || 0)
  }), { payment: 0, principal: 0, interest: 0 });

  // Safe number formatting function
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return `${currencySymbol}0.00`;
    return `${currencySymbol}${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-emerald-500" />
            Amortization Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold text-gray-600">Payment Date</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Payment</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Principal</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Interest</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Remaining Balance</th>
                </tr>
              </thead>
              <tbody>
                {visibleData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{format(row.date, 'MMM dd, yyyy')}</td>
                    <td className="text-right p-4">{formatCurrency(row.payment)}</td>
                    <td className="text-right p-4">{formatCurrency(row.principal)}</td>
                    <td className="text-right p-4">{formatCurrency(row.interest)}</td>
                    <td className="text-right p-4">{formatCurrency(row.remainingBalance)}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-semibold">
                  <td className="p-4">Total</td>
                  <td className="text-right p-4">{formatCurrency(totals.payment)}</td>
                  <td className="text-right p-4">{formatCurrency(totals.principal)}</td>
                  <td className="text-right p-4">{formatCurrency(totals.interest)}</td>
                  <td className="text-right p-4">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          {amortizationData.length > 3 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show More
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
