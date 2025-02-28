
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditDebtForm } from "@/components/EditDebtForm";
import { Debt } from "@/lib/types/debt";
import { X } from "lucide-react";

interface EditDebtDialogProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDebtDialog = ({ debt, isOpen, onClose }: EditDebtDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-white">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-2xl font-semibold text-gray-900">Edit Debt: {debt.name}</DialogTitle>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </DialogHeader>
        <EditDebtForm debt={debt} onSubmit={onClose} />
      </DialogContent>
    </Dialog>
  );
};
