
import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Debt } from "@/lib/types/debt";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Calendar, Info } from "lucide-react";
import { format, addMonths } from "date-fns";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { usePaymentHistory } from "@/hooks/use-payment-history";
import { useDebtMutations } from "@/hooks/use-debt-mutations";

interface PaymentDialogProps {
  debt: Debt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ debt, open, onOpenChange }: PaymentDialogProps) {
  const { toast } = useToast();
  const { recordPayment } = usePaymentHistory();
  const { updateDebt } = useDebtMutations();
  
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"full" | "partial" | "extra">("full");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPaymentDate, setNextPaymentDate] = useState<Date>(new Date());

  useEffect(() => {
    if (debt && open) {
      setPaymentAmount(debt.minimum_payment);
      setPaymentType("full");
      
      // Set next payment date one month from current next_payment_date
      if (debt.next_payment_date) {
        const currentNextDate = new Date(debt.next_payment_date);
        setNextPaymentDate(addMonths(currentNextDate, 1));
      } else {
        setNextPaymentDate(addMonths(new Date(), 1));
      }
    }
  }, [debt, open]);

  if (!debt) return null;

  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value as "full" | "partial" | "extra");
    if (value === "full") {
      setPaymentAmount(debt.minimum_payment);
    } else if (value === "extra") {
      setPaymentAmount(debt.minimum_payment * 2);
    }
  };

  const handleSubmit = async () => {
    if (!debt) return;
    
    setIsSubmitting(true);
    
    try {
      // Record the payment to payment history
      await recordPayment.mutateAsync({
        amount: paymentAmount,
        debtId: debt.id
      });
      
      // Update the debt's balance and next payment date
      const updatedBalance = Math.max(0, debt.balance - (paymentAmount - (debt.interest_rate / 100 * debt.balance / 12)));
      
      // Fixed: Use mutateAsync instead of calling updateDebt directly
      await updateDebt.mutateAsync({
        ...debt,
        balance: updatedBalance,
        next_payment_date: nextPaymentDate.toISOString(),
        // If balance is 0, mark as paid
        status: updatedBalance <= 0 ? 'paid' : 'active',
        closed_date: updatedBalance <= 0 ? new Date().toISOString() : undefined
      });
      
      toast({
        title: "Payment recorded",
        description: `${debt.currency_symbol}${paymentAmount.toFixed(2)} payment has been recorded for ${debt.name}.`,
        variant: "default",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Record Payment for {debt.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-type" className="text-right">
              Type
            </Label>
            <Select 
              value={paymentType} 
              onValueChange={handlePaymentTypeChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Payment</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="extra">Extra Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                {debt.currency_symbol}
              </span>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="pl-7"
                step="0.01"
                min="0.01"
                max={debt.balance}
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground px-4 py-2 bg-muted rounded-md flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Payment Details</p>
              <p>Current balance: {debt.currency_symbol}{debt.balance.toFixed(2)}</p>
              <p>Minimum payment: {debt.currency_symbol}{debt.minimum_payment.toFixed(2)}</p>
              <p>Interest rate: {debt.interest_rate}%</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting || paymentAmount <= 0}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
