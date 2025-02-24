
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { generateDebtOverviewPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import { DebtStrategyCard } from "./cards/DebtStrategyCard";
import { PaymentCalculationService } from "./services/PaymentCalculationService";

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
  
  // Calculate payment allocations and payoff details
  const allocations = PaymentCalculationService.calculatePaymentAllocations(sortedDebts, totalMonthlyPayment);
  const payoffDetails = PaymentCalculationService.calculatePayoffDetails(sortedDebts, timelineData, allocations);

  const handleDownload = () => {
    try {
      const baseMonths = timelineData.length;
      const optimizedMonths = timelineData.length;
      const baseTotalInterest = timelineData.reduce((sum, data) => sum + data.baselineInterest, 0);
      const optimizedTotalInterest = timelineData.reduce((sum, data) => sum + data.acceleratedInterest, 0);
      
      const doc = generateDebtOverviewPDF(
        sortedDebts,
        totalMonthlyPayment,
        Math.max(0, totalMonthlyPayment - sortedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0)),
        baseMonths,
        optimizedMonths,
        baseTotalInterest,
        optimizedTotalInterest,
        selectedStrategy,
        [],
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
                  <DebtStrategyCard
                    debt={debt}
                    index={index}
                    allocation={allocations.get(debt.id) || 0}
                    payoffDetails={payoffDetails[debt.id]}
                    currencySymbol={debt.currency_symbol}
                  />
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
