import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import confetti from 'canvas-confetti';
import { generateDebtOverviewPDF } from "@/lib/utils/pdf/pdfGenerator";
import { PaymentComparison } from "./results/PaymentComparison";
import { ResultsSummary } from "./results/ResultsSummary";
import { NextStepsLayout } from "./results/NextStepsLayout";
import { useToast } from "@/hooks/use-toast";
import { DebtTimelineCalculator } from "@/lib/services/calculations/DebtTimelineCalculator";

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
  const { toast } = useToast();
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

  // Trigger confetti on dialog open
  if (isOpen) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  const timelineResults = DebtTimelineCalculator.calculateTimeline(
    debts,
    monthlyPayment,
    selectedStrategy,
    oneTimeFundings
  );

  console.log('Timeline calculation results in ResultsDialog:', timelineResults);

  const handleDownload = () => {
    try {
      const doc = generateDebtOverviewPDF(
        debts,
        monthlyPayment,
        extraPayment,
        timelineResults.baselineMonths,
        timelineResults.acceleratedMonths,
        timelineResults.baselineInterest,
        timelineResults.acceleratedInterest,
        selectedStrategy,
        oneTimeFundings,
        currencySymbol
      );
      doc.save('debt-freedom-plan.pdf');
      
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Your Path to Debt Freedom
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          <PaymentComparison
            debts={debts}
            monthlyPayment={monthlyPayment}
            strategy={selectedStrategy}
            oneTimeFundings={oneTimeFundings}
            currencySymbol={currencySymbol}
          />

          <ResultsSummary
            debts={debts}
            monthlyPayment={monthlyPayment}
            strategy={selectedStrategy}
            oneTimeFundings={oneTimeFundings}
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
            <Button 
              className="gap-2 bg-[#00D382] hover:bg-[#00D382]/90 text-white" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download Your Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};