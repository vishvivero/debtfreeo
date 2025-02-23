
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { DebtConfirmationDialog } from "@/components/debt/DebtConfirmationDialog";
import { useState } from "react";
import type { Debt } from "@/lib/types/debt";

interface AddDebtDialogProps {
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  currencySymbol: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AddDebtDialog = ({ onAddDebt, currencySymbol, isOpen, onClose }: AddDebtDialogProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedDebt, setAddedDebt] = useState<Omit<Debt, "id"> | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  const handleAddDebt = async (debt: Omit<Debt, "id">) => {
    try {
      await onAddDebt(debt);
      setAddedDebt(debt);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error in AddDebtDialog:", error);
      throw error;
    }
  };

  const handleAddAnother = () => {
    setShowConfirmation(false);
  };

  const handleFinish = () => {
    setShowConfirmation(false);
    if (onClose) {
      onClose();
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

  return (
    <>
      {/* Main Add Debt Dialog */}
      {typeof isOpen !== 'undefined' ? (
        <Dialog open={isOpen && !showConfirmation} onOpenChange={handleOpenChange}>
          {dialogContent}
        </Dialog>
      ) : (
        <Dialog open={!showConfirmation}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add debt
            </Button>
          </DialogTrigger>
          {dialogContent}
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      {addedDebt && (
        <DebtConfirmationDialog
          debt={addedDebt}
          isOpen={showConfirmation}
          onAddAnother={handleAddAnother}
          onFinish={handleFinish}
        />
      )}
    </>
  );
};
