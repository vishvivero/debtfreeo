import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";

interface PayoffProgressProps {
  totalDebt: number;
  paidAmount: number;
  currencySymbol: string;
  projectedPayoffDate?: Date;
}

export const PayoffProgress = ({ totalDebt, paidAmount, currencySymbol, projectedPayoffDate }: PayoffProgressProps) => {
  const { oneTimeFundings } = useOneTimeFunding();
  
  const totalOneTimeFunding = oneTimeFundings.reduce((sum, funding) => sum + funding.amount, 0);
  const totalPaidAmount = paidAmount + totalOneTimeFunding;
  const progressPercentage = totalDebt > 0 ? (totalPaidAmount / (totalPaidAmount + totalDebt)) * 100 : 0;
  
  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="text-gray-900 dark:text-white font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-gray-100 dark:bg-gray-700" />
        </div>
      </motion.div>
    </div>
  );
};