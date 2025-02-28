
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditDebtForm } from "@/components/EditDebtForm";
import { Debt } from "@/lib/types/debt";
import { X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getExchangeRateUpdateDate } from "@/lib/utils/currencyConverter";

interface EditDebtDialogProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDebtDialog = ({ debt, isOpen, onClose }: EditDebtDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-white rounded-xl overflow-hidden">
        <DialogHeader className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-semibold text-gray-800">Edit Debt: {debt.name}</DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
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
        </DialogHeader>
        <div className="p-4">
          <EditDebtForm debt={debt} onSubmit={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
