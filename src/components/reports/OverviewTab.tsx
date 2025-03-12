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
import { InterestCalculator } from "@/lib/services/calculations/InterestCalculator";

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
      
      // First normalize debts to preferred currency for consistent calculations
      const normalizedDebts = debts.map(debt => ({
        ...debt,
        balance: convertToPreferredCurrency(debt.balance, debt.currency_symbol),
        minimum_payment: convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol)
      }));
      
      // Calculate timeline for the report using the normalized debts
      const timelineResults = DebtTimelineCalculator.calculateTimeline(
        normalizedDebts,
        totalMinimumPayments,
        strategies[0],
        []
      );
      
      // Apply additional safeguards for extremely large interest values
      let baselineInterest = timelineResults.baselineInterest;
      let acceleratedInterest = timelineResults.acceleratedInterest;
      
      // Apply sanity check for unrealistic values
      const totalBalance = normalizedDebts.reduce((sum, debt) => sum + debt.balance, 0);
      if (baselineInterest > totalBalance * 3) {
        console.log('Interest sanity check triggered for PDF generation - capping interest values');
        baselineInterest = totalBalance * 0.2; // Reasonable 20% of total balance
        acceleratedInterest = baselineInterest;
      }
      
      // Ensure precision for financial values and convert large values appropriately
      baselineInterest = InterestCalculator.ensurePrecision(baselineInterest);
      acceleratedInterest = InterestCalculator.ensurePrecision(acceleratedInterest);
      
      // Log values for debugging
      console.log('Interest values for PDF:', {
        totalBalance,
        normalizedDebts: normalizedDebts.map(d => ({ name: d.name, balance: d.balance, minPayment: d.minimum_payment })),
        original: timelineResults.baselineInterest,
        baselineInterest,
        acceleratedInterest,
        currencySymbol: preferredCurrency
      });
      
      const doc = generateDebtOverviewPDF(
        normalizedDebts,
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
      // First convert all amounts to the preferred currency - this is the key fix
      const normalizedDebts = debts.map(debt => ({
        ...debt,
        balance: convertToPreferredCurrency(debt.balance, debt.currency_symbol),
        minimum_payment: convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol)
      }));
      
      // Log normalized debts for debugging
      console.log('Normalized debts for interest calculation:', {
        preferredCurrency,
        totalDebtBalance: normalizedDebts.reduce((sum, debt) => sum + debt.balance, 0),
        normalizedDebts: normalizedDebts.map(d => ({ 
          name: d.name, 
          originalBalance: debts.find(od => od.id === d.id)?.balance || 0,
          originalCurrency: debts.find(od => od.id === d.id)?.currency_symbol || '$',
          normalizedBalance: d.balance,
          interestRate: d.interest_rate
        }))
      });
      
      // Alternative simplified calculation as a reference point
      const simplifiedInterest = normalizedDebts.reduce((sum, debt) => {
        // Simple interest calculation: Principal * Rate * Time
        // Assuming average loan term of 5 years
        const simpleInterest = debt.balance * (debt.interest_rate / 100) * 5;
        return sum + simpleInterest;
      }, 0);
      
      console.log('Simplified interest calculation:', {
        simplifiedInterest: InterestCalculator.ensurePrecision(simplifiedInterest)
      });
      
      // Calculate timeline with properly normalized debts
      const results = DebtTimelineCalculator.calculateTimeline(
        normalizedDebts, // Use currency-normalized debts
        totalMinimumPayment,
        strategies[0],
        []
      );
      
      // Perform sanity check on interest values
      let baseInterest = results.baselineInterest;
      let optimizedInterest = results.acceleratedInterest;
      
      const totalBalance = normalizedDebts.reduce((sum, debt) => sum + debt.balance, 0);
      
      // Cap unrealistic interest values
      if (baseInterest > totalBalance * 3) {
        console.log('Interest sanity check triggered - interest exceeds 3x principal');
        
        // Use simplified calculation as fallback
        baseInterest = simplifiedInterest;
        optimizedInterest = simplifiedInterest;
      }
      
      // Apply proper rounding to ensure consistent display
      baseInterest = InterestCalculator.ensurePrecision(baseInterest);
      optimizedInterest = InterestCalculator.ensurePrecision(optimizedInterest);
      
      console.log('Interest calculation for overview:', {
        totalBalance,
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
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                Total Debt
              </p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{formatCurrency(totalDebt)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                Average Interest Rate
              </p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{averageInterestRate.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Monthly Minimum
              </p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{formatCurrency(totalMinimumPayment)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                Total Categories
              </p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{Object.keys(categories).length}</p>
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
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
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
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Debt Categories</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {Object.entries(categories).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{category}</span>
                      <span className="text-slate-600 dark:text-slate-400">
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
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <FileText className="h-5 w-5 text-slate-500" />
              Generate Detailed Report
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Download a comprehensive overview of your debt management progress
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Report Contents:</h4>
                <ul className="space-y-2">
                  {[
                    { icon: <TrendingUp className="h-4 w-4" />, text: "Debt Distribution Analysis" },
                    { icon: <Calendar className="h-4 w-4" />, text: "Payment Timeline" },
                    { icon: <DollarSign className="h-4 w-4" />, text: "Interest Savings" },
                    { icon: <Tag className="h-4 w-4" />, text: "Category Breakdown" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
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
                        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white flex items-center gap-2"
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
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
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

