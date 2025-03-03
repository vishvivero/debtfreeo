
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditDebtForm } from "@/components/EditDebtForm";
import { Debt } from "@/lib/types/debt";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getExchangeRateUpdateDate } from "@/lib/utils/currencyConverter";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditDebtDialogProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDebtDialog = ({ debt, isOpen, onClose }: EditDebtDialogProps) => {
  const isMobile = useIsMobile();

  const formContent = (
    <EditDebtForm debt={debt} onSubmit={onClose} />
  );

  // If on mobile, use Sheet instead of Dialog
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90%] sm:max-w-full p-0 bg-white overflow-y-auto">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              Edit Debt: {debt.name}
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
            </SheetTitle>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop, use Dialog with updated styling
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-xl overflow-hidden">
        <DialogHeader className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-semibold text-gray-800">Edit Debt: {debt.name}</DialogTitle>
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
        </DialogHeader>
        <div className="p-0">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};
