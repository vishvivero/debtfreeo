
import { AmortizationEntry } from "@/lib/utils/payment/standardizedCalculations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface AmortizationTableProps {
  debt: {
    name: string;
    is_gold_loan?: boolean;
    balance: number;
    interest_rate: number;
    loan_term_months?: number;
    final_payment_date?: string;
  };
  amortizationData: AmortizationEntry[];
  currencySymbol: string;
}

export const AmortizationTable = ({ debt, amortizationData, currencySymbol }: AmortizationTableProps) => {
  const formatNumber = (num: number): string => {
    return Number(num.toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateGoldLoanAmortization = (): AmortizationEntry[] => {
    if (!debt.loan_term_months) {
      console.log('No loan term months specified for gold loan, using default amortization');
      return amortizationData;
    }

    const schedule: AmortizationEntry[] = [];
    const monthlyInterest = Number(((debt.balance * debt.interest_rate) / 100 / 12).toFixed(2));
    let currentDate = new Date();
    
    const finalPaymentDate = debt.final_payment_date 
      ? new Date(debt.final_payment_date)
      : new Date(currentDate.setMonth(currentDate.getMonth() + debt.loan_term_months));

    currentDate = new Date();

    try {
      for (let month = 0; month < debt.loan_term_months; month++) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() + month);
        const isLastPayment = month === debt.loan_term_months - 1;

        schedule.push({
          date,
          payment: Number(isLastPayment ? (monthlyInterest + debt.balance).toFixed(2) : monthlyInterest.toFixed(2)),
          principal: Number(isLastPayment ? debt.balance.toFixed(2) : "0"),
          interest: monthlyInterest,
          remainingBalance: Number(isLastPayment ? "0" : debt.balance.toFixed(2)),
          startingBalance: Number(debt.balance.toFixed(2)),
          endingBalance: Number(isLastPayment ? "0" : debt.balance.toFixed(2))
        });

        if (date >= finalPaymentDate) break;
      }

      return schedule;
    } catch (error) {
      console.error('Error generating gold loan amortization schedule:', error);
      return amortizationData;
    }
  };

  const displayData = debt.is_gold_loan 
    ? calculateGoldLoanAmortization() 
    : amortizationData;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        {debt.is_gold_loan ? "Gold Loan Payment Schedule" : "Amortization Schedule"} for {debt.name}
      </h2>
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
            {displayData.map((entry, index) => (
              <TableRow key={index} className={entry.remainingBalance === 0 ? "bg-green-50" : ""}>
                <TableCell>{format(entry.date, 'MMM d, yyyy')}</TableCell>
                <TableCell>{currencySymbol}{formatNumber(entry.payment)}</TableCell>
                <TableCell>{currencySymbol}{formatNumber(entry.principal)}</TableCell>
                <TableCell>{currencySymbol}{formatNumber(entry.interest)}</TableCell>
                <TableCell>{currencySymbol}{formatNumber(entry.remainingBalance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
