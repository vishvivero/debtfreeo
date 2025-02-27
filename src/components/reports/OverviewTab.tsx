
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileDown, DollarSign, Calendar, Tag, Download, FileText, ChevronRight } from "lucide-react";
import { generateDebtOverviewPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { strategies } from "@/lib/strategies";
import { useProfile } from "@/hooks/use-profile";
import { DebtTimelineCalculator } from "@/lib/services/calculations/DebtTimelineCalculator";
import { Debt } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      
      const timelineResults = DebtTimelineCalculator.calculateTimeline(
        debts,
        totalMinimumPayments,
        strategies[0],
        []
      );
      
      const doc = generateDebtOverviewPDF(
        debts,
        totalMinimumPayments,
        0,
        timelineResults.baselineMonths,
        timelineResults.acceleratedMonths,
        timelineResults.baselineInterest,
        timelineResults.acceleratedInterest,
        strategies[0],
        [],
        currencySymbol
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
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
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
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
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
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
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
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

      {/* Categories Section */}
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
                      {currencySymbol}{amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Redesigned Download Report Section */}
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
                    { icon: <DollarSign className="h-4 w-4" />, text: "Debt Distribution Analysis" },
                    { icon: <Calendar className="h-4 w-4" />, text: "Payment Timeline" },
                    { icon: <DollarSign className="h-4 w-4" />, text: "Interest Analysis" },
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
