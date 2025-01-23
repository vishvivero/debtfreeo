import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChartBar, Calendar, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";

interface ResultsDialogProps {
  debts: Debt[];
  monthlyPayment: number;
  extraPayment: number;
  oneTimeFundings: { amount: number; payment_date: Date }[];
  selectedStrategy: Strategy;
  currencySymbol?: string;
}

export const ResultsDialog = ({
  debts,
  monthlyPayment,
  extraPayment,
  oneTimeFundings,
  selectedStrategy,
  currencySymbol = '£'
}: ResultsDialogProps) => {
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalOneTimeFunding = oneTimeFundings.reduce((sum, funding) => sum + funding.amount, 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-sm"
        >
          <ChartBar className="h-5 w-5" />
          Get My Results
        </motion.button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Your Personalized Debt Payoff Plan</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Plan</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Debt</p>
                    <p className="text-2xl font-semibold">{formatCurrency(totalDebt, currencySymbol)}</p>
                  </div>
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </Card>
              <Card className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="text-2xl font-semibold">{formatCurrency(monthlyPayment, currencySymbol)}</p>
                    <p className="text-xs text-muted-foreground">
                      Including {formatCurrency(extraPayment, currencySymbol)} extra payment
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </Card>
              <Card className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">One-time Payments</p>
                    <p className="text-2xl font-semibold">{formatCurrency(totalOneTimeFunding, currencySymbol)}</p>
                    <p className="text-xs text-muted-foreground">
                      Across {oneTimeFundings.length} future payments
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="detailed">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Schedule</h3>
              {debts.map((debt) => (
                <Card key={debt.id} className="p-4">
                  <h4 className="font-medium">{debt.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Current balance: {formatCurrency(debt.balance, currencySymbol)}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="recommendations">
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium">Strategy: {selectedStrategy.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedStrategy.description}</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};