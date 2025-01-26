import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { calculatePayoffDetails } from "@/lib/utils/payment/paymentCalculations";
import confetti from 'canvas-confetti';
import { generateDebtOverviewPDF } from "@/lib/utils/pdf/pdfGenerator";
import { PaymentComparison } from "./results/PaymentComparison";
import { ResultsSummary } from "./results/ResultsSummary";
import { NextStepsLayout } from "./results/NextStepsLayout";

interface ResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  monthlyPayment: number;
  extraPayment: number;
  oneTimeFundings: OneTimeFunding[];
  selectedStrategy: Strategy;
  currencySymbol?: string;
}

export const ResultsDialog = ({
  isOpen,
  onClose,
  debts,
  monthlyPayment,
  extraPayment,
  oneTimeFundings,
  selectedStrategy,
  currencySymbol = '£'
}: ResultsDialogProps) => {
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  
  // Calculate payoff details with and without extra payments
  const basePayoff = calculatePayoffDetails(debts, totalMinPayment, selectedStrategy, []);
  const optimizedPayoff = calculatePayoffDetails(debts, monthlyPayment, selectedStrategy, oneTimeFundings);

  // Calculate savings
  const baseMonths = Math.max(...Object.values(basePayoff).map(d => d.months));
  const optimizedMonths = Math.max(...Object.values(optimizedPayoff).map(d => d.months));
  const monthsSaved = Math.max(0, baseMonths - optimizedMonths);

  const baseTotalInterest = Object.values(basePayoff).reduce((sum, detail) => sum + detail.totalInterest, 0);
  const optimizedTotalInterest = Object.values(optimizedPayoff).reduce((sum, detail) => sum + detail.totalInterest, 0);
  const interestSaved = Math.max(0, baseTotalInterest - optimizedTotalInterest);

  // Get projected payoff date
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + optimizedMonths);

  // Trigger confetti on dialog open
  if (isOpen && interestSaved > 0) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  const handleDownload = async () => {
    const doc = generateDebtOverviewPDF(
      debts,
      new Map(debts.map(debt => [debt.id, monthlyPayment / debts.length])),
      optimizedPayoff,
      monthlyPayment,
      selectedStrategy
    );
    doc.save('debt-payoff-plan.pdf');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Your Personalized Debt Payoff Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          <PaymentComparison
            debts={debts}
            monthlyPayment={monthlyPayment}
            basePayoffMonths={baseMonths}
            optimizedPayoffMonths={optimizedMonths}
            baseTotalInterest={baseTotalInterest}
            optimizedTotalInterest={optimizedTotalInterest}
            currencySymbol={currencySymbol}
          />

          <ResultsSummary
            interestSaved={interestSaved}
            monthsSaved={monthsSaved}
            payoffDate={payoffDate}
            currencySymbol={currencySymbol}
          />

          <NextStepsLayout
            monthlyPayment={monthlyPayment}
            minimumPayment={totalMinPayment}
            extraPayment={extraPayment}
            oneTimeFundings={oneTimeFundings}
            currencySymbol={currencySymbol}
          />

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};