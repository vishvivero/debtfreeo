
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { Debt } from "@/lib/types/debt";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getExchangeRateUpdateDate } from "@/lib/utils/currencyConverter";

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
  const isMobile = useIsMobile();
  
  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  const formContent = (
    <AddDebtForm 
      onAddDebt={onAddDebt} 
      currencySymbol={currencySymbol} 
      onClose={onClose} 
      showCancelButton={false}
    />
  );

  // If on mobile, use Sheet instead of Dialog
  if (isMobile) {
    // If isOpen is provided, render controlled sheet
    if (typeof isOpen !== 'undefined') {
      return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
          <SheetContent side="bottom" className="h-[90%] sm:max-w-full p-0 bg-white overflow-y-auto">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                Add New Debt
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" className="max-w-[300px]">
                      <p className="text-sm">
                        You can select a different currency for this debt. <br />
                        All totals will be converted to your preferred currency.<br />
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

    // Otherwise render uncontrolled sheet with trigger
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button className="bg-[#34D399] hover:bg-[#10B981] text-white">
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90%] sm:max-w-full p-0 bg-white overflow-y-auto">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              Add New Debt
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-[300px]">
                    <p className="text-sm">
                      You can select a different currency for this debt. <br />
                      All totals will be converted to your preferred currency.<br />
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

  // For desktop, use the original Dialog
  const dialogContent = (
    <DialogContent className="sm:max-w-[550px] p-0 bg-white rounded-xl overflow-hidden">
      <DialogHeader className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <DialogTitle className="text-xl font-semibold text-gray-800">Add New Debt</DialogTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-[300px]">
                <p className="text-sm">
                  You can select a different currency for this debt. <br />
                  All totals will be converted to your preferred currency.<br />
                  Exchange rates last updated: {getExchangeRateUpdateDate()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DialogHeader>
      {formContent}
    </DialogContent>
  );

  // If isOpen is provided, render controlled dialog
  if (typeof isOpen !== 'undefined') {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
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
      {dialogContent}
    </Dialog>
  );
};
