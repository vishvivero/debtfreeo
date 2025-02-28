
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditDebtForm } from "@/components/EditDebtForm";
import { Debt } from "@/lib/types/debt";
import { X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { getExchangeRateUpdateDate } from "@/lib/utils/currencyConverter";

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
          <div className="flex items-center gap-2">
            <DialogTitle className="text-2xl font-semibold text-gray-900">Edit Debt: {debt.name}</DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    You can select a different currency for this debt. <br />
                    Exchange rates last updated: {getExchangeRateUpdateDate()}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
