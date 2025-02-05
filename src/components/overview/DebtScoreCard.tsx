import { Card, CardContent } from "@/components/ui/card";
import { useDebts } from "@/hooks/use-debts";
import { calculateDebtScore } from "@/lib/utils/scoring/debtScoreCalculator";
import { motion } from "framer-motion";
import { DebtChart } from "@/components/DebtChart";
import { DebtCategoryChart } from "@/components/debt/DebtCategoryChart";
import { DebtNameChart } from "@/components/debt/DebtNameChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, BarChart3, PieChart } from "lucide-react";

export const DebtScoreCard = () => {
  const { debts, profile } = useDebts();
  const currencySymbol = profile?.preferred_currency || '£';

  if (!debts || debts.length === 0) {
    return null;
  }

  const score = calculateDebtScore(debts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Debt Overview</h2>
            <p className="text-sm text-gray-500">
              Track your progress and analyze your debt distribution
            </p>
          </div>

          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="balance" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Balance
              </TabsTrigger>
              <TabsTrigger value="category" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                By Category
              </TabsTrigger>
              <TabsTrigger value="name" className="flex items-center gap-2">
                <ChartLine className="h-4 w-4" />
                By Name
              </TabsTrigger>
            </TabsList>

            <TabsContent value="balance">
              <DebtChart 
                debts={debts} 
                monthlyPayment={profile?.monthly_payment || 0}
                currencySymbol={currencySymbol}
              />
            </TabsContent>

            <TabsContent value="category">
              <DebtCategoryChart 
                debts={debts}
                currencySymbol={currencySymbol}
              />
            </TabsContent>

            <TabsContent value="name">
              <DebtNameChart 
                debts={debts}
                currencySymbol={currencySymbol}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};