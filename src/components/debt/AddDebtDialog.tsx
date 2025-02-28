
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { Debt } from "@/lib/types/debt";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

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

  const dialogContent = <DialogContent className="sm:max-w-[550px] p-0 bg-white rounded-xl overflow-hidden">
      <DialogHeader className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <DialogTitle className="text-xl font-semibold text-gray-800">Add New Debt</DialogTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">You can select a different currency for this debt. <br />All totals will be converted to your preferred currency.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
