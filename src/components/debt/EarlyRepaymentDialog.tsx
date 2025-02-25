
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { usePaymentHistory } from "@/hooks/use-payment-history";
import { useToast } from "@/hooks/use-toast";

interface EarlyRepaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  balance: number;
  currencySymbol: string;
  onRepaymentComplete: () => void;
}

export const EarlyRepaymentDialog = ({
  isOpen,
  onClose,
  debtId,
  balance,
  currencySymbol,
  onRepaymentComplete
}: EarlyRepaymentDialogProps) => {
  const [amount, setAmount] = useState(balance);
  const { recordPayment } = usePaymentHistory();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordPayment.mutateAsync({ 
        amount,
        debtId 
      });
      
      toast({
        title: "Payment Recorded",
        description: `Successfully recorded early repayment of ${currencySymbol}${amount.toLocaleString()}`,
      });
      
      onRepaymentComplete();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error Recording Payment",
        description: "There was an error recording your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Early Repayment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              You are about to make an early repayment. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pl-7"
                step="0.01"
                min="0"
                max={balance}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
              Confirm Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
