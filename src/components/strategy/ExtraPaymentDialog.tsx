
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { ArrowRight, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/strategies";

interface ExtraPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  currencySymbol?: string;
  currentExtraPayment: number;
  totalMinimumPayments: number;
}

export const ExtraPaymentDialog = ({
  isOpen,
  onClose,
  onSubmit,
  currencySymbol = "£",
  currentExtraPayment = 0,
  totalMinimumPayments = 0
}: ExtraPaymentDialogProps) => {
  const [extraPayment, setExtraPayment] = useState(currentExtraPayment);
  
  // Reset the state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setExtraPayment(currentExtraPayment);
    }
  }, [isOpen, currentExtraPayment]);

  const handleSubmit = () => {
    onSubmit(extraPayment);
    onClose();
  };

  const handleSliderChange = (value: number[]) => {
    setExtraPayment(value[0]);
  };

  // Calculate percentage increase over minimum payment
  const percentageIncrease = totalMinimumPayments > 0 
    ? Math.round((extraPayment / totalMinimumPayments) * 100) 
    : 0;

  // Suggested extra payment amounts (25%, 50%, 75%, 100% of minimum payment)
  const suggestedAmounts = [
    Math.round(totalMinimumPayments * 0.25),
    Math.round(totalMinimumPayments * 0.5),
    Math.round(totalMinimumPayments * 0.75),
    Math.round(totalMinimumPayments)
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Set Extra Monthly Payment
          </DialogTitle>
          <DialogDescription>
            Add an extra amount to your monthly payment to pay off debt faster and save on interest.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(extraPayment, currencySymbol)}
            </div>
            <div className="text-sm text-gray-500">
              {percentageIncrease > 0 && 
                `${percentageIncrease}% of your minimum payment`
              }
            </div>
          </div>
          
          <div className="space-y-4">
            <label htmlFor="extraPayment" className="text-sm font-medium">
              Adjust extra payment amount
            </label>
            <Slider
              id="extraPayment"
              min={0}
              max={Math.max(totalMinimumPayments * 2, 1000)}
              step={5}
              value={[extraPayment]}
              onValueChange={handleSliderChange}
              className="py-4"
            />
            
            <div className="mt-2">
              <label htmlFor="paymentInput" className="text-sm font-medium mb-2 block">
                Or enter a specific amount
              </label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <span className="text-gray-500">{currencySymbol}</span>
                </div>
                <Input
                  id="paymentInput"
                  type="number"
                  min="0"
                  step="any"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Suggested amounts</label>
            <div className="grid grid-cols-4 gap-2">
              {suggestedAmounts.map((amount, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => setExtraPayment(amount)}
                  className={`h-10 p-0 ${extraPayment === amount ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}
                >
                  {formatCurrency(amount, currencySymbol)}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Total Monthly Payment</p>
                <p className="text-sm text-blue-700">
                  {formatCurrency(totalMinimumPayments + extraPayment, currencySymbol)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Apply Extra Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
