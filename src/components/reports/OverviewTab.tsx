import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileDown, TrendingUp, DollarSign, Calendar, Tag, Download, FileText, ChevronRight } from "lucide-react";
import { DebtOverviewChart } from "./DebtOverviewChart";
import { generateDebtOverviewPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { strategies } from "@/lib/strategies";
import { useProfile } from "@/hooks/use-profile";
import { DebtTimelineCalculator } from "@/lib/services/calculations/DebtTimelineCalculator";
import { Debt } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrency } from "@/hooks/use-currency";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

interface OverviewTabProps {
  debts: Debt[];
}

export const OverviewTab = ({ debts }: OverviewTabProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const { preferredCurrency, convertToPreferredCurrency, formatCurrency } = useCurrency();

  const handleDownloadReport = () => {
    try {
      // Calculate total minimum payments in the user's preferred currency
      const totalMinimumPayments = debts.reduce((sum, debt) => {
        return sum + convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol);
      }, 0);
      
      // Calculate timeline for the report using the preferred currency values
      const timelineResults = DebtTimelineCalculator.calculateTimeline(
        debts,
        totalMinimumPayments,
        strategies[0],
        []
      );
      
      // Ensure precision for financial values and convert large values appropriately
      const baselineInterest = InterestCalculator.ensurePrecision(timelineResults.baselineInterest);
      const acceleratedInterest = InterestCalculator.ensurePrecision(timelineResults.acceleratedInterest);
      
      // Log values for debugging
      console.log('Interest values for PDF:', {
        original: timelineResults.baselineInterest,
        baselineInterest,
        acceleratedInterest
      });
      
      const doc = generateDebtOverviewPDF(
        debts,
        totalMinimumPayments,
        0,
        timelineResults.baselineMonths,
        timelineResults.acceleratedMonths,
        baselineInterest,
        acceleratedInterest,
        strategies[0],
        [],
        preferredCurrency
      );
      
      doc.save('debt-overview-report.pdf');
      
      toast({
        title: "Success",
        description: "Your debt overview report has been downloaded successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate debt metrics with proper currency handling
  const totalDebt = debts.reduce((sum, debt) => {
    return sum + convertToPreferredCurrency(debt.balance, debt.currency_symbol);
  }, 0);
  
  const averageInterestRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length 
    : 0;
    
  const totalMinimumPayment = debts.reduce((sum, debt) => {
    return sum + convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol); 
  }, 0);

  // Calculate debt by category
  const categories: Record<string, number> = {};
  debts.forEach(debt => {
    const convertedBalance = convertToPreferredCurrency(debt.balance, debt.currency_symbol);
    categories[debt.category] = (categories[debt.category] || 0) + convertedBalance;
  });

  // Calculate interest with proper precision and currency handling
  const calculateInterest = () => {
    if (debts.length === 0) return { baseInterest: 0, optimizedInterest: 0 };
    
    try {
      // First convert all amounts to the preferred currency
      const normalizedDebts = debts.map(debt => ({
        ...debt,
        balance: convertToPreferredCurrency(debt.balance, debt.currency_symbol),
        minimum_payment: convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol)
      }));
      
      // Calculate timeline with proper interest calculation
      const results = DebtTimelineCalculator.calculateTimeline(
        normalizedDebts, // Use currency-normalized debts
        totalMinimumPayment,
        strategies[0],
        []
      );
      
      // Apply proper rounding to ensure consistent display
      const baseInterest = InterestCalculator.ensurePrecision(results.baselineInterest);
      const optimizedInterest = InterestCalculator.ensurePrecision(results.acceleratedInterest);
      
      console.log('Interest calculation for overview:', {
        normalizedDebts: normalizedDebts.map(d => ({ name: d.name, balance: d.balance, minPayment: d.minimum_payment })),
        rawBase: results.baselineInterest,
        rawOptimized: results.acceleratedInterest,
        rounded: { baseInterest, optimizedInterest },
        formatted: { 
          baseInterest: formatCurrency(baseInterest), 
          optimizedInterest: formatCurrency(optimizedInterest)
        }
      });
      
      return { baseInterest, optimizedInterest };
    } catch (error) {
      console.error('Error calculating interest:', error);
      return { baseInterest: 0, optimizedInterest: 0 };
    }
  };
  
  // Get the interest values with proper calculation
  const { baseInterest, optimizedInterest } = calculateInterest();

  return (
    <div className="space-y-6">
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
              <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
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
              <p className="text-2xl font-bold">{formatCurrency(totalMinimumPayment)}</p>
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
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <FileText className="h-5 w-5" />
              Generate Detailed Report
            </CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Download a comprehensive overview of your debt management progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Report Contents:</h4>
                <ul className="space-y-2">
                  {[
                    { icon: <TrendingUp className="h-4 w-4" />, text: "Debt Distribution Analysis" },
                    { icon: <Calendar className="h-4 w-4" />, text: "Payment Timeline" },
                    { icon: <DollarSign className="h-4 w-4" />, text: "Interest Savings" },
                    { icon: <Tag className="h-4 w-4" />, text: "Category Breakdown" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      {item.icon}
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center items-center space-y-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleDownloadReport}
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 p-6"
                      >
                        <Download className="h-5 w-5" />
                        Download PDF Report
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate a detailed PDF report of your debt overview</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-sm text-purple-600 dark:text-purple-400 text-center">
                  PDF format • Includes all metrics • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
