
import { motion } from "framer-motion";
import { DebtTableContainer } from "@/components/DebtTableContainer";
import { Debt } from "@/lib/types/debt";
import { Info } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OverviewDebtsProps {
  debts: Debt[];
  monthlyPayment: number;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  currencySymbol: string;
  selectedStrategy: string;
}

export const OverviewDebts = ({
  debts,
  monthlyPayment,
  onUpdateDebt,
  onDeleteDebt,
  currencySymbol,
  selectedStrategy,
}: OverviewDebtsProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Your Debts
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              Track and manage all your debts in one place
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click on any row to view detailed payment schedule and analytics</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <DebtTableContainer 
        debts={debts} 
        monthlyPayment={monthlyPayment}
        onUpdateDebt={onUpdateDebt}
        onDeleteDebt={onDeleteDebt}
        currencySymbol={currencySymbol}
        selectedStrategy={selectedStrategy}
      />
    </motion.section>
  );
};
