import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DebtChart } from "@/components/DebtChart";
import { useDebts } from "@/hooks/use-debts";
import { formatCurrency } from "@/lib/paymentCalculator";
import { calculatePayoffDetails } from "@/lib/utils/payment/paymentCalculations";
import { strategies } from "@/lib/strategies";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { X } from "lucide-react";

interface ExtraPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPayment: number;
  onSave: (amount: number) => void;
  currencySymbol: string;
  totalDebtValue: number;
}

export const ExtraPaymentDialog = ({
  isOpen,
  onClose,
  currentPayment,
  onSave,
  currencySymbol,
  totalDebtValue,
}: ExtraPaymentDialogProps) => {
  const { debts, profile } = useDebts();
  const { oneTimeFundings } = useOneTimeFunding();
  const [extraPayment, setExtraPayment] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setExtraPayment(0);
    }
  }, [isOpen]);

  const handleSliderChange = (value: number[]) => {
    setExtraPayment(value[0]);
    onSave(value[0]);
  };

  const handleSave = () => {
    onClose();
  };

  const calculateStats = () => {
    if (!debts || debts.length === 0) return null;

    console.log('Calculating payoff details with:', {
      debts: debts.length,
      currentPayment,
      extraPayment,
      oneTimeFundings: oneTimeFundings.length,
      strategy: profile?.selected_strategy || 'avalanche'
    });

    // Calculate baseline (without extra payment)
    const basePayoffDetails = calculatePayoffDetails(
      debts,
      currentPayment,
      strategies.find(s => s.id === profile?.selected_strategy) || strategies[0],
      oneTimeFundings
    );

    // Calculate with extra payment
    const withExtraPayoffDetails = calculatePayoffDetails(
      debts,
      currentPayment + extraPayment,
      strategies.find(s => s.id === profile?.selected_strategy) || strategies[0],
      oneTimeFundings
    );

    // Find the longest payoff time for each scenario
    const baseMaxMonths = Math.max(...Object.values(basePayoffDetails).map(d => d.months));
    const extraMaxMonths = Math.max(...Object.values(withExtraPayoffDetails).map(d => d.months));

    // Calculate total interest for each scenario
    const baseTotalInterest = Object.values(basePayoffDetails)
      .reduce((sum, detail) => sum + detail.totalInterest, 0);
    const extraTotalInterest = Object.values(withExtraPayoffDetails)
      .reduce((sum, detail) => sum + detail.totalInterest, 0);

    const monthsDifference = Math.max(0, baseMaxMonths - extraMaxMonths);
    const interestSaved = Math.max(0, baseTotalInterest - extraTotalInterest);

    // Get projected payoff date
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + extraMaxMonths);

    console.log('Calculated payoff stats:', {
      baseMonths: baseMaxMonths,
      extraMonths: extraMaxMonths,
      monthsSaved: monthsDifference,
      interestSaved,
      projectedDate: payoffDate.toISOString()
    });

    return {
      debtFreeDate: payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      countdown: `${extraMaxMonths} months`,
      accelerated: `${Math.floor(monthsDifference / 12) > 0 ? `${Math.floor(monthsDifference / 12)} years ` : ''}${monthsDifference % 12} months`,
      interestSaved: formatCurrency(interestSaved, currencySymbol),
    };
  };

  const stats = calculateStats() || {
    debtFreeDate: "-",
    countdown: "-",
    accelerated: "-",
    interestSaved: "-"
  };

  if (!debts) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-8 pb-2 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-[#00D382]">
              Set Extra Monthly Payment
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-sm text-gray-500">Debt-free Date</h3>
              <p className="text-xl font-semibold text-[#00D382]">{stats.debtFreeDate}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-500">Time Until Debt-free</h3>
              <p className="text-xl font-semibold text-gray-700">{stats.countdown}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-500">Time Saved</h3>
              <p className="text-xl font-semibold text-[#00D382]">{stats.accelerated}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-500">Interest Saved</h3>
              <p className="text-xl font-semibold text-[#00D382]">{stats.interestSaved}</p>
            </div>
          </div>

          <div className="h-[400px] rounded-lg overflow-hidden bg-white/95">
            <DebtChart
              debts={debts}
              monthlyPayment={currentPayment + extraPayment}
              currencySymbol={currencySymbol}
              oneTimeFundings={oneTimeFundings}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-600">Extra monthly payment</span>
              <span className="text-lg font-semibold text-[#00D382]">
                {currencySymbol}{extraPayment}
              </span>
            </div>
            <Slider
              value={[extraPayment]}
              onValueChange={handleSliderChange}
              max={totalDebtValue}
              step={10}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Adjust the slider to see how extra payments affect your debt payoff timeline
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-[#00D382] hover:bg-[#00D382]/90 text-white py-6 text-lg"
          >
            Save Extra Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};