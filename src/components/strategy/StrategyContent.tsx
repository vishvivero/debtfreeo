
import { useEffect, useState } from "react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { Card, CardContent } from "@/components/ui/card";
import { MinimumPaymentSection } from "./MinimumPaymentSection";
import { ExtraPaymentSection } from "./ExtraPaymentSection";
import { OneTimeFundingSection } from "./OneTimeFundingSection";
import { ExtraPaymentDialog } from "./ExtraPaymentDialog";
import { OneTimeFundingDialog } from "./OneTimeFundingDialog";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { OneTimeFunding } from "@/lib/types/payment";
import { ResultsDialog } from "./ResultsDialog";
import { PaymentCalculator } from "./PaymentCalculator";
import { Button } from "@/components/ui/button";
import { ArrowRight, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { PayoffTimelineContainer } from "@/components/debt/timeline/PayoffTimelineContainer";
import { SavingsStreakPanel } from "./SavingsStreakPanel";
import { PaymentAllocator } from "@/lib/services/calculations/PaymentAllocator";
import { TotalPaymentSection } from "./TotalPaymentSection";
import { PaymentOverviewSection } from "./PaymentOverviewSection";

interface StrategyContentProps {
  debts: Debt[];
  selectedStrategy: Strategy;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  onSelectStrategy: (strategy: Strategy) => void;
  preferredCurrency?: string;
  totalDebtValue: number;
  totalMinimumPayments: number;
}

export const StrategyContent = ({
  debts,
  selectedStrategy,
  onUpdateDebt,
  onDeleteDebt,
  onSelectStrategy,
  preferredCurrency,
  totalDebtValue,
  totalMinimumPayments,
}: StrategyContentProps) => {
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [isExtraPaymentDialogOpen, setIsExtraPaymentDialogOpen] = useState(false);
  const [isOneTimeFundingDialogOpen, setIsOneTimeFundingDialogOpen] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const { oneTimeFundings, addOneTimeFunding, removeOneTimeFunding } = useOneTimeFunding();
  
  const currencySymbol = preferredCurrency || "£";
  
  // Calculate total monthly payment (minimums + extra)
  const totalMonthlyPayment = totalMinimumPayments + extraPayment;

  const handleExtraPaymentAdd = () => {
    setIsExtraPaymentDialogOpen(true);
  };

  const handleOneTimeFundingAdd = () => {
    setIsOneTimeFundingDialogOpen(true);
  };

  const handleOneTimeFundingSubmit = (funding: OneTimeFunding) => {
    addOneTimeFunding(funding);
    setIsOneTimeFundingDialogOpen(false);
  };

  const handleViewResults = () => {
    setIsResultsDialogOpen(true);
  };

  // Calculate payment allocations
  const paymentAllocations = PaymentAllocator.allocatePayments(
    selectedStrategy.calculate([...debts]),
    totalMonthlyPayment,
    selectedStrategy,
    preferredCurrency
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PayoffTimelineContainer 
            debts={debts}
            extraPayment={extraPayment}
            strategy={selectedStrategy}
            oneTimeFundings={oneTimeFundings}
          />
        </div>
        <div>
          <SavingsStreakPanel currencySymbol={currencySymbol} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PaymentOverviewSection 
            totalMinimumPayments={totalMinimumPayments}
            extraPayment={extraPayment}
            onExtraPaymentChange={setExtraPayment}
            onOpenExtraPaymentDialog={handleExtraPaymentAdd}
            currencySymbol={currencySymbol}
            totalDebtValue={totalDebtValue}
          />
          
          <OneTimeFundingSection 
            oneTimeFundings={oneTimeFundings}
            onAddFunding={handleOneTimeFundingAdd}
            onRemoveFunding={removeOneTimeFunding}
            currencySymbol={currencySymbol}
          />
        </div>
        
        <div className="lg:col-span-1">
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              <PaymentCalculator
                debts={debts}
                monthlyPayment={totalMonthlyPayment}
                extraPayment={extraPayment}
                strategy={selectedStrategy}
                oneTimeFundings={oneTimeFundings}
                currencySymbol={currencySymbol}
              />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Button 
                  onClick={handleViewResults} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <PieChart className="mr-2 h-4 w-4" />
                  View Detailed Results
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ExtraPaymentDialog
        isOpen={isExtraPaymentDialogOpen}
        onClose={() => setIsExtraPaymentDialogOpen(false)}
        onAddExtraPayment={setExtraPayment}
        currencySymbol={currencySymbol}
        currentExtraPayment={extraPayment}
        totalMinimumPayments={totalMinimumPayments}
      />
      
      <OneTimeFundingDialog
        isOpen={isOneTimeFundingDialogOpen}
        onClose={() => setIsOneTimeFundingDialogOpen(false)}
        onSubmit={handleOneTimeFundingSubmit}
        currencySymbol={currencySymbol}
      />
      
      <ResultsDialog
        isOpen={isResultsDialogOpen}
        onClose={() => setIsResultsDialogOpen(false)}
        debts={debts}
        monthlyPayment={totalMonthlyPayment}
        extraPayment={extraPayment}
        oneTimeFundings={oneTimeFundings}
        selectedStrategy={selectedStrategy}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
