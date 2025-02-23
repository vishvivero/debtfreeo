
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, CheckCircle, CreditCard, Calendar, Wallet, Percent, Coins } from "lucide-react";
import type { Debt } from "@/lib/types";

interface DebtConfirmationDialogProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
  onAddAnother: () => void;
}

export const DebtConfirmationDialog = ({
  debt,
  isOpen,
  onClose,
  onAddAnother,
}: DebtConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Debt Added Successfully
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Debt Summary</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Debt Name</p>
                  <p className="font-medium">{debt.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="font-medium">
                    {debt.currency_symbol}{debt.balance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Percent className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="font-medium">{debt.interest_rate}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Coins className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Minimum Payment</p>
                  <p className="font-medium">
                    {debt.currency_symbol}{debt.minimum_payment.toLocaleString()}
                  </p>
                </div>
              </div>

              {debt.next_payment_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Next Payment Date</p>
                    <p className="font-medium">
                      {format(new Date(debt.next_payment_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={onAddAnother}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another Debt
            </Button>
            <Button onClick={onClose} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Finish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
