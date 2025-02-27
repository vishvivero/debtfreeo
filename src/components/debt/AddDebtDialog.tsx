import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
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
  const dialogContent = <DialogContent className="sm:max-w-[600px] p-6 bg-white">
      <DialogHeader className="flex items-center justify-between">
        <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Debt</DialogTitle>
        
      </DialogHeader>
      <AddDebtForm onAddDebt={onAddDebt} currencySymbol={currencySymbol} />
    </DialogContent>;

  // If isOpen is provided, render controlled dialog
  if (typeof isOpen !== 'undefined') {
    return <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>;
  }

  // Otherwise render uncontrolled dialog with trigger
  return <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add debt
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>;
};