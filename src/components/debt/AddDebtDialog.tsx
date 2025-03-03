import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { Debt } from "@/lib/types/debt";

interface AddDebtDialogProps {
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  currencySymbol: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AddDebtDialog = ({
  onAddDebt,
  currencySymbol,
  isOpen,
  onClose
}: AddDebtDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  // If isOpen is provided, render controlled dialog
  if (typeof isOpen !== 'undefined') {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px] p-0 bg-white rounded-xl overflow-hidden">
          <DialogHeader className="flex items-center justify-between p-4 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-800">Add New Debt</DialogTitle>
          </DialogHeader>
          <AddDebtForm onAddDebt={onAddDebt} currencySymbol={currencySymbol} onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise render uncontrolled dialog with trigger
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#34D399] hover:bg-[#10B981] text-white">
          <Plus className="mr-2 h-4 w-4" /> Add debt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 bg-white rounded-xl overflow-hidden">
        <DialogHeader className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-800">Add New Debt</DialogTitle>
        </DialogHeader>
        <AddDebtForm onAddDebt={onAddDebt} currencySymbol={currencySymbol} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
