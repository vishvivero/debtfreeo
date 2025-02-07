import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileDown, TrendingUp, DollarSign, Calendar, Tag } from "lucide-react";
import { DebtOverviewChart } from "./DebtOverviewChart";
import { Debt } from "@/lib/types/debt";
import { generateDebtOverviewPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { calculateMonthlyAllocations } from "@/components/strategy/PaymentCalculator";
import { strategies } from "@/lib/strategies";
import { useProfile } from "@/hooks/use-profile";

interface OverviewTabProps {
  debts: Debt[];
}

export const OverviewTab = ({ debts }: OverviewTabProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const currencySymbol = profile?.preferred_currency || '£';

  const handleDownloadReport = () => {
    try {
      const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
      const { allocations, payoffDetails } = calculateMonthlyAllocations(
        debts,
        totalMinimumPayments,
        strategies[0] // Default to first strategy
      );
      
      const doc = generateDebtOverviewPDF(
        debts,
        totalMinimumPayments,
        0, // extraPayment
        0, // baseMonths
        0, // optimizedMonths
        0, // baseTotalInterest
        0, // optimizedTotalInterest
        strategies[0],
        [], // oneTimeFundings
        currencySymbol
      );
      
      doc.save('debt-overview-report.pdf');
      
      toast({
        title: "Success",
        description: "Debt overview report downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const averageInterestRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length 
    : 0;
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

  const categories = debts.reduce((acc, debt) => {
    acc[debt.category] = (acc[debt.category] || 0) + debt.balance;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Debt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currencySymbol}{totalDebt.toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Interest Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{averageInterestRate.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Monthly Minimum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currencySymbol}{totalMinimumPayment.toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-700 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Object.keys(categories).length}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Debt Distribution</CardTitle>
              <CardDescription>Overview of your debt portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <DebtOverviewChart debts={debts} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Debt Categories</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {Object.entries(categories).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">
                        {debts[0]?.currency_symbol || '£'}{amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Download Report Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-end"
      >
        <Button 
          onClick={handleDownloadReport}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Download Overview Report
        </Button>
      </motion.div>
    </div>
  );
};
