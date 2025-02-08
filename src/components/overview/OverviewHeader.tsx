
import { CurrencySelector } from "@/components/profile/CurrencySelector";
import { motion } from "framer-motion";
import { useDebts } from "@/hooks/use-debts";
import { CircularProgress } from "@/components/debt/details/CircularProgress";
import { ArrowUpRight, Wallet2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OverviewHeaderProps {
  currencySymbol: string;
  onCurrencyChange: (currency: string) => void;
}

export const OverviewHeader = ({
  currencySymbol,
  onCurrencyChange,
}: OverviewHeaderProps) => {
  const { debts, profile } = useDebts();
  
  // Calculate total debt
  const totalDebt = debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0;
  
  // Calculate progress percentage (this is a simple example, adjust based on your needs)
  const progressPercentage = profile?.monthly_payment 
    ? Math.min(Math.round((profile.monthly_payment / (totalDebt || 1)) * 100), 100)
    : 0;

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Your Financial Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and optimize your journey to financial freedom
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <CurrencySelector
            value={currencySymbol}
            onValueChange={onCurrencyChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Debt</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currencySymbol}{totalDebt.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Wallet2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payment</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currencySymbol}{profile?.monthly_payment?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative p-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Debt Payment Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {progressPercentage}%
                </p>
              </div>
              <CircularProgress 
                percentage={progressPercentage}
                size={48}
                strokeWidth={4}
                circleColor="stroke-emerald-500"
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
