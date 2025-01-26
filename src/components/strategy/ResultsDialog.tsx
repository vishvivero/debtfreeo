import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { Calendar, Target, TrendingUp, Download, DollarSign } from "lucide-react";
import { calculatePayoffDetails } from "@/lib/utils/payment/paymentCalculations";
import confetti from 'canvas-confetti';
import { generateDebtOverviewPDF } from "@/lib/utils/pdf/pdfGenerator";

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

  // Calculate total one-time payments
  const totalOneTimePayments = oneTimeFundings.reduce((sum, funding) => sum + Number(funding.amount), 0);

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
          <DialogTitle className="text-2xl font-bold text-center">Your Personalized Debt Payoff Plan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          {/* Payment Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Without DebtFreeo</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Monthly Payment: {currencySymbol}{totalMinPayment.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Total Interest: {currencySymbol}{baseTotalInterest.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Months to Pay Off: {baseMonths}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50">
              <h3 className="font-semibold mb-2">With DebtFreeo</h3>
              <div className="space-y-2">
                <p className="text-sm text-emerald-600">
                  Monthly Payment: {currencySymbol}{monthlyPayment.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-600">
                  Total Interest: {currencySymbol}{optimizedTotalInterest.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-600">
                  Months to Pay Off: {optimizedMonths}
                </p>
              </div>
            </div>
          </div>

          {/* Savings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Interest Saved</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(interestSaved, currencySymbol)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Time Saved</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {monthsSaved} months
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-50 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </motion.div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Payment Details</h3>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Monthly Payment</p>
                    <p className="text-sm text-gray-600">
                      Minimum: {currencySymbol}{totalMinPayment.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-emerald-600">
                  {currencySymbol}{monthlyPayment.toLocaleString()}
                </p>
              </motion.div>

              {totalOneTimePayments > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">One-time Payments</p>
                      <p className="text-sm text-gray-600">
                        {oneTimeFundings.length} scheduled payment{oneTimeFundings.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-purple-600">
                    {currencySymbol}{totalOneTimePayments.toLocaleString()}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

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