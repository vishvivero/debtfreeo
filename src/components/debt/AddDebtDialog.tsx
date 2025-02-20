import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { Debt } from "@/lib/types/debt";
import { useState } from "react";

interface AddDebtDialogProps {
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  currencySymbol: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AddDebtDialog = ({ onAddDebt, currencySymbol, isOpen: controlledIsOpen, onClose }: AddDebtDialogProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [lastAddedDebt, setLastAddedDebt] = useState<Omit<Debt, "id"> | null>(null);
  
  const isOpen = typeof controlledIsOpen !== 'undefined' ? controlledIsOpen : uncontrolledIsOpen;
  const setIsOpen = typeof controlledIsOpen !== 'undefined' ? onClose : setUncontrolledIsOpen;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowConfirmation(false);
      setLastAddedDebt(null);
      setIsOpen?.();
    }
  };

  const handleAddDebt = async (debt: Omit<Debt, "id">) => {
    console.log("Adding debt:", debt);
    await onAddDebt(debt);
    setLastAddedDebt(debt);
    setShowConfirmation(true);
  };

  const handleAddMore = () => {
    console.log("Adding another debt - dialog should stay open");
    setShowConfirmation(false);
    setLastAddedDebt(null);
  };

  const handleFinish = () => {
    console.log("Finishing debt addition");
    setShowConfirmation(false);
    setLastAddedDebt(null);
    setIsOpen?.();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      currencyDisplay: 'symbol'
    }).format(amount).replace('£', currencySymbol);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const dialogContent = (
    <>
      {!showConfirmation && (
        <DialogContent className="sm:max-w-[500px] p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Debt</DialogTitle>
          </DialogHeader>
          <AddDebtForm onAddDebt={handleAddDebt} currencySymbol={currencySymbol} />
        </DialogContent>
      )}

      <AlertDialog open={showConfirmation}>
        <AlertDialogContent className="max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-green-600">
              Debt Added Successfully!
            </AlertDialogTitle>
            {lastAddedDebt && (
              <div className="mt-4 space-y-3 text-left">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-medium text-gray-900">{lastAddedDebt.name}</h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <p>Balance: {formatCurrency(lastAddedDebt.balance)}</p>
                    <p>Interest Rate: {lastAddedDebt.interest_rate}%</p>
                    <p>Minimum Payment: {formatCurrency(lastAddedDebt.minimum_payment)}</p>
                    <p>Category: {lastAddedDebt.category}</p>
                    <p>Next Payment: {formatDate(lastAddedDebt.next_payment_date || '')}</p>
                  </div>
                </div>
                <AlertDialogDescription className="text-center mt-4">
                  Would you like to add another debt?
                </AlertDialogDescription>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleAddMore}
              className="flex-1"
            >
              Add Another Debt
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Finish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (typeof controlledIsOpen !== 'undefined') {
    return (
      <Dialog open={controlledIsOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={uncontrolledIsOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add debt
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
};
