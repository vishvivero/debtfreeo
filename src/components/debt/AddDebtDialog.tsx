
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { DebtConfirmationDialog } from "./DebtConfirmationDialog";
import { useState } from "react";
import { Debt } from "@/lib/types/debt";

interface AddDebtDialogProps {
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  currencySymbol: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AddDebtDialog = ({ onAddDebt, currencySymbol, isOpen, onClose }: AddDebtDialogProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedDebt, setAddedDebt] = useState<Debt | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(isOpen || false);

  const handleOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      onClose?.();
    }
  };

  const handleAddDebt = async (debt: Omit<Debt, "id">) => {
    try {
      await onAddDebt(debt);
      // Close the add dialog and show confirmation
      setIsAddDialogOpen(false);
      // We need to cast the debt to include an ID since it was just added
      setAddedDebt(debt as Debt);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error in AddDebtDialog:", error);
      throw error;
    }
  };

  const handleAddAnother = () => {
    setShowConfirmation(false);
    setIsAddDialogOpen(true);
  };

  const handleFinish = () => {
    setShowConfirmation(false);
    onClose?.();
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px] p-6 bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Debt</DialogTitle>
      </DialogHeader>
      <AddDebtForm onAddDebt={handleAddDebt} currencySymbol={currencySymbol} />
    </DialogContent>
  );

  return (
    <>
      {typeof isOpen !== 'undefined' ? (
        <Dialog open={isAddDialogOpen} onOpenChange={handleOpenChange}>
          {dialogContent}
        </Dialog>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add debt
            </Button>
          </DialogTrigger>
          {dialogContent}
        </Dialog>
      )}

      {addedDebt && (
        <DebtConfirmationDialog
          debt={addedDebt}
          isOpen={showConfirmation}
          onClose={handleFinish}
          onAddAnother={handleAddAnother}
        />
      )}
    </>
  );
};
