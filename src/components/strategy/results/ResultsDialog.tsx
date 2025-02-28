
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtRepaymentPlan } from "../DebtRepaymentPlan";
import { PaymentComparison } from "../PaymentComparison";
import { useState } from "react";
import { OneTimeFunding } from "@/lib/types/payment";
import { ResultsSummary } from "./ResultsSummary";
import { NextStepsLayout } from "./NextStepsLayout";

interface ResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  monthlyPayment: number;
  extraPayment: number;
  oneTimeFundings: OneTimeFunding[];
  selectedStrategy: Strategy;
  currencySymbol?: string;
}

export const ResultsDialog = ({
  isOpen,
  onClose,
  debts,
  monthlyPayment,
  extraPayment,
  oneTimeFundings,
  selectedStrategy,
  currencySymbol = "$"
}: ResultsDialogProps) => {
  const [activeTab, setActiveTab] = useState("summary");

  if (!debts || debts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="plan">Repayment Plan</TabsTrigger>
            <TabsTrigger value="comparison">Payment Comparison</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="py-4">
            <ResultsSummary
              debts={debts}
              monthlyPayment={monthlyPayment}
              extraPayment={extraPayment}
              strategy={selectedStrategy}
              oneTimeFundings={oneTimeFundings}
              currencySymbol={currencySymbol}
            />
          </TabsContent>
          
          <TabsContent value="plan" className="py-4">
            <DebtRepaymentPlan
              debts={debts}
              totalMonthlyPayment={monthlyPayment}
              selectedStrategy={selectedStrategy}
              preferredCurrency={currencySymbol}
            />
          </TabsContent>
          
          <TabsContent value="comparison" className="py-4">
            <PaymentComparison
              debts={debts}
              monthlyPayment={monthlyPayment}
              extraPayment={extraPayment}
              selectedStrategy={selectedStrategy}
              oneTimeFundings={oneTimeFundings}
              currencySymbol={currencySymbol}
            />
          </TabsContent>
          
          <TabsContent value="next-steps" className="py-4">
            <NextStepsLayout
              debts={debts}
              monthlyPayment={monthlyPayment} 
              extraPayment={extraPayment}
              selectedStrategy={selectedStrategy}
              currencySymbol={currencySymbol}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
