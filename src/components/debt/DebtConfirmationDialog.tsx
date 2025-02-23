
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Plus, ArrowRight, Calendar, Percent, DollarSign } from "lucide-react";
import { format } from "date-fns";
import type { Debt } from "@/lib/types";
import { motion } from "framer-motion";

interface DebtConfirmationDialogProps {
  debt: Omit<Debt, "id">;
  isOpen: boolean;
  onAddAnother: () => void;
  onFinish: () => void;
}

export const DebtConfirmationDialog = ({
  debt,
  isOpen,
  onAddAnother,
  onFinish,
}: DebtConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onFinish}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="bg-emerald-100 rounded-full p-1">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            Debt Added Successfully
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-6"
        >
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">{debt.name}</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="font-medium">{debt.currency_symbol}{debt.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="font-medium">{debt.interest_rate}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Minimum Payment</p>
                  <p className="font-medium">{debt.currency_symbol}{debt.minimum_payment.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Next Payment</p>
                  <p className="font-medium">{format(new Date(debt.next_payment_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onAddAnother}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Debt
            </Button>
            <Button
              onClick={onFinish}
              className="flex-1"
              variant="outline"
            >
              Finish <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
