
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
  const calculateGoldLoanAmortization = (): AmortizationEntry[] => {
    // Create a default schedule if required fields are missing
    if (!debt.loan_term_months) {
      console.log('No loan term months specified for gold loan, using default amortization');
      return amortizationData;
    }

    const schedule: AmortizationEntry[] = [];
    const monthlyInterest = (debt.balance * debt.interest_rate) / 100 / 12;
    let currentDate = new Date();
    
    // If final_payment_date is not provided, calculate it based on loan term
    const finalPaymentDate = debt.final_payment_date 
      ? new Date(debt.final_payment_date)
      : new Date(currentDate.setMonth(currentDate.getMonth() + debt.loan_term_months));

    currentDate = new Date(); // Reset current date after potentially modifying it

    try {
      // Generate monthly interest-only payments
      for (let month = 0; month < debt.loan_term_months; month++) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() + month);
        const isLastPayment = month === debt.loan_term_months - 1;

        schedule.push({
          date,
          payment: isLastPayment ? monthlyInterest + debt.balance : monthlyInterest,
          principal: isLastPayment ? debt.balance : 0,
          interest: monthlyInterest,
          remainingBalance: isLastPayment ? 0 : debt.balance,
          startingBalance: debt.balance,
          endingBalance: isLastPayment ? 0 : debt.balance
        });

        // Stop if we've reached or passed the final payment date
        if (date >= finalPaymentDate) break;
      }

      console.log('Generated gold loan amortization schedule:', {
        loanAmount: debt.balance,
        monthlyInterest,
        numberOfPayments: schedule.length
      });

      return schedule;
    } catch (error) {
      console.error('Error generating gold loan amortization schedule:', error);
      return amortizationData; // Fallback to standard amortization if there's an error
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
