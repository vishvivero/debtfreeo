
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { Debt } from "@/lib/types/debt";

interface AddDebtDialogProps {
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  currencySymbol: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AddDebtDialog = ({ onAddDebt, currencySymbol, isOpen, onClose }: AddDebtDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  const handleAddDebt = async (debt: Omit<Debt, "id">) => {
    try {
      await onAddDebt(debt);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error in AddDebtDialog:", error);
      throw error; // Let the form handle the error
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px] p-6 bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Debt</DialogTitle>
      </DialogHeader>
      <AddDebtForm onAddDebt={handleAddDebt} currencySymbol={currencySymbol} />
    </DialogContent>
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
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add debt
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
};
