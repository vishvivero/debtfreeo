import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, DollarSign, Clock, Calendar } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import confetti from 'canvas-confetti';
import { generateDebtOverviewPDF } from "@/lib/utils/pdf/pdfGenerator";
import { PaymentComparison } from "./results/PaymentComparison";
import { useToast } from "@/hooks/use-toast";
import { DebtTimelineCalculator } from "@/lib/services/calculations/DebtTimelineCalculator";
import { motion } from "framer-motion";

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
        <DialogHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto bg-primary/10 p-3 rounded-full w-fit"
          >
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
              Your Path to Debt Freedom
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              Here's your personalized debt payoff strategy
            </p>
          </motion.div>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-800">Interest Saved</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {currencySymbol}{timelineResults.interestSaved.toLocaleString()}
              </p>
              <p className="text-sm text-emerald-700">Total savings on interest</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Time Saved</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {timelineResults.monthsSaved} months
              </p>
              <p className="text-sm text-blue-700">Faster debt freedom</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {timelineResults.payoffDate.toLocaleDateString('en-US', { 
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-purple-700">Target completion date</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PaymentComparison
              debts={debts}
              monthlyPayment={monthlyPayment}
              strategy={selectedStrategy}
              oneTimeFundings={oneTimeFundings}
              currencySymbol={currencySymbol}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between pt-4 gap-4"
          >
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
            <Button 
              className="w-full gap-2 bg-[#00D382] hover:bg-[#00D382]/90 text-white" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download Plan
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};