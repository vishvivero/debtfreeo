
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

  const dialogContent = <DialogContent className="sm:max-w-[550px] p-0 bg-white rounded-xl overflow-hidden border-green-100 shadow-lg">
      <DialogHeader className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-white">
        <DialogTitle className="text-xl font-semibold text-gray-800">Add New Debt</DialogTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-green-100"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogHeader>
      <AddDebtForm onAddDebt={onAddDebt} currencySymbol={currencySymbol} onClose={onClose} />
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
        <Button className="bg-[#34D399] hover:bg-[#10B981] text-white">
          <Plus className="mr-2 h-4 w-4" /> Add debt
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>;
};
