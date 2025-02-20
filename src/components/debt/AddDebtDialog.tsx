
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

export const AddDebtDialog = ({ onAddDebt, currencySymbol, isOpen, onClose }: AddDebtDialogProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setShowConfirmation(false);
      onClose?.();
    }
  };

  const handleAddDebt = async (debt: Omit<Debt, "id">) => {
    await onAddDebt(debt);
    setShowConfirmation(true);
  };

  const handleAddMore = () => {
    setShowConfirmation(false);
  };

  const handleFinish = () => {
    setShowConfirmation(false);
    setDialogOpen(false);
    onClose?.();
  };

  const dialogContent = (
    <>
      <DialogContent className="sm:max-w-[500px] p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Debt</DialogTitle>
        </DialogHeader>
        <AddDebtForm onAddDebt={handleAddDebt} currencySymbol={currencySymbol} />
      </DialogContent>

      <AlertDialog open={showConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Debt Added Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to add another debt or finish?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAddMore}
              className="flex-1"
            >
              Add Another Debt
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1"
            >
              Finish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  // If isOpen is provided, render controlled dialog
  if (typeof isOpen !== 'undefined') {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  // Otherwise render uncontrolled dialog with trigger
  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add debt
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
};
