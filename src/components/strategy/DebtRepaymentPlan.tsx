import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { generateDebtOverviewPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { PaymentSchedule } from "@/components/debt/PaymentSchedule";
import { Badge } from "@/components/ui/badge";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import { calculatePaymentSchedule } from "@/components/debt/utils/paymentSchedule";

interface DebtRepaymentPlanProps {
  debts: Debt[];
  totalMonthlyPayment: number;
  selectedStrategy: Strategy;
}

export const DebtRepaymentPlan = ({
  debts,
  totalMonthlyPayment,
  selectedStrategy,
}: DebtRepaymentPlanProps) => {
  const { toast } = useToast();
  
  if (!debts || debts.length === 0) return null;

  console.log('DebtRepaymentPlan: Starting calculation with strategy:', selectedStrategy.name);
  const sortedDebts = selectedStrategy.calculate([...debts]);
  
  // Calculate timeline data using the accelerated timeline logic
  const timelineData = calculateTimelineData(sortedDebts, totalMonthlyPayment, selectedStrategy);
  
  // Calculate payment allocations based on the strategy
  const allocations = new Map<string, number>();
  const totalMinPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const extraPayment = Math.max(0, totalMonthlyPayment - totalMinPayments);

  // Distribute minimum payments
  sortedDebts.forEach(debt => {
    allocations.set(debt.id, debt.minimum_payment);
  });

  // Add extra payment to highest priority debt
  if (extraPayment > 0 && sortedDebts.length > 0) {
    const highestPriorityDebt = sortedDebts[0];
    allocations.set(
      highestPriorityDebt.id,
      (allocations.get(highestPriorityDebt.id) || 0) + extraPayment
    );
  }

  // Track redistributions from paid off debts
  const redistributionHistory = new Map<string, { fromDebtId: string; amount: number; month: number; }[]>();
  let paidOffDebts = new Set<string>();
  let releasedPayments = new Map<string, number>();

  // Analyze timeline data to track redistributions
  timelineData.forEach((data, monthIndex) => {
    sortedDebts.forEach((debt, debtIndex) => {
      const prevMonth = monthIndex > 0 ? timelineData[monthIndex - 1] : null;
      const wasActive = prevMonth && prevMonth.acceleratedBalance > 0;
      const isPaidOff = data.acceleratedBalance === 0;

      // If debt was just paid off this month
      if (wasActive && isPaidOff && !paidOffDebts.has(debt.id)) {
        paidOffDebts.add(debt.id);
        const releasedAmount = debt.minimum_payment;
        releasedPayments.set(debt.id, releasedAmount);

        // Find next unpaid debt to receive redistribution
        const nextUnpaidDebt = sortedDebts.find((d, idx) => 
          idx > debtIndex && !paidOffDebts.has(d.id)
        );

        if (nextUnpaidDebt) {
          const currentRedistributions = redistributionHistory.get(nextUnpaidDebt.id) || [];
          redistributionHistory.set(nextUnpaidDebt.id, [
            ...currentRedistributions,
            {
              fromDebtId: debt.id,
              amount: releasedAmount,
              month: monthIndex + 1
            }
          ]);
        }
      }
    });
  });

  // Calculate payoff details from timeline data
  const payoffDetails = sortedDebts.reduce((acc, debt) => {
    // Find the month where this debt is paid off in the accelerated timeline
    const payoffMonth = timelineData.findIndex((data, index) => {
      const prevMonth = index > 0 ? timelineData[index - 1] : null;
      return prevMonth?.acceleratedBalance > 0 && data.acceleratedBalance === 0;
    });

    const months = payoffMonth !== -1 ? payoffMonth + 1 : timelineData.length;
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    acc[debt.id] = {
      months,
      payoffDate,
      totalInterest: timelineData[months - 1]?.acceleratedInterest || 0,
      redistributionHistory: redistributionHistory.get(debt.id) || []
    };
    return acc;
  }, {} as { [key: string]: { 
    months: number; 
    payoffDate: Date; 
    totalInterest: number;
    redistributionHistory: { fromDebtId: string; amount: number; month: number; }[];
  } });

  const handleDownload = () => {
    try {
      const baseMonths = timelineData.length;
      const optimizedMonths = timelineData.length;
      const baseTotalInterest = timelineData.reduce((sum, data) => sum + data.baselineInterest, 0);
      const optimizedTotalInterest = timelineData.reduce((sum, data) => sum + data.acceleratedInterest, 0);
      
      const doc = generateDebtOverviewPDF(
        sortedDebts,
        totalMonthlyPayment,
        extraPayment,
        baseMonths,
        optimizedMonths,
        baseTotalInterest,
        optimizedTotalInterest,
        selectedStrategy,
        [], // empty array for oneTimeFundings since we don't have them in this context
        debts[0]?.currency_symbol || '£'
      );
      doc.save('debt-payoff-strategy.pdf');
      
      toast({
        title: "Success",
        description: "Your payoff strategy report has been downloaded",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate the payoff strategy report",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <Card className="bg-white/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Debt Repayment Plan
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="debt-cards-container flex space-x-4 p-4">
              {sortedDebts.map((debt, index) => (
                <div key={debt.id} className="flex-none w-[350px]">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="space-y-1">
                        <CardTitle>{debt.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {debt.banker_name || "Not specified"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance:</p>
                          <p className="text-lg font-semibold">
                            {debt.currency_symbol}{debt.balance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interest Rate:</p>
                          <p className="text-lg font-semibold">
                            {debt.interest_rate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Payment:</p>
                          <p className="text-lg font-semibold">
                            {debt.currency_symbol}{(allocations.get(debt.id) || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payoff Date:</p>
                          <p className="text-lg font-semibold">
                            {payoffDetails[debt.id].payoffDate.toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Payment Schedule</h4>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {index === 0 ? 'Priority' : 'Upcoming'}
                          </Badge>
                        </div>
                        <PaymentSchedule
                          payments={calculatePaymentSchedule(
                            debt,
                            payoffDetails[debt.id],
                            allocations.get(debt.id) || debt.minimum_payment,
                            index === 0
                          )}
                          currencySymbol={debt.currency_symbol}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};
