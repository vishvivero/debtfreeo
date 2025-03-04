
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditDebtForm } from "@/components/EditDebtForm";
import { Debt } from "@/lib/types/debt";

interface EditDebtDialogProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDebtDialog = ({ debt, isOpen, onClose }: EditDebtDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] w-full p-0 bg-white rounded-xl overflow-hidden">
        <DialogHeader className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-800">Edit Debt: {debt.name}</DialogTitle>
        </DialogHeader>
        <div className="p-0">
          <EditDebtForm debt={debt} onSubmit={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
