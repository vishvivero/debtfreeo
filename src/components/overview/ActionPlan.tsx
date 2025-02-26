
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, ArrowUp, PiggyBank, LineChart, Percent, CreditCard, Calendar, ArrowUpRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ActionPlanProps {
  highestAprDebt?: {
    name: string;
    apr: number;
  };
  lowestBalanceDebt?: {
    name: string;
    balance: number;
  };
  monthlyInterest: number;
  optimizationScore: number;
  currencySymbol: string;
}

export const ActionPlan = ({
  highestAprDebt,
  lowestBalanceDebt,
  monthlyInterest,
  optimizationScore,
  currencySymbol
}: ActionPlanProps) => {
  return (
    <Card className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Action Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Percent className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Priority Focus</h3>
                <p className="font-medium mt-2">
                  Focus on {highestAprDebt?.name || "Credit Card X"} with{" "}
                  {highestAprDebt?.apr || 26}% APR
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  This debt has the highest interest rate and costs you the most
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Win */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-emerald-50 p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <ArrowUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Quick Win</h3>
                <p className="font-medium mt-2">
                  Target {lowestBalanceDebt?.name || "Credit Card X"} with{" "}
                  {currencySymbol}
                  {lowestBalanceDebt?.balance?.toLocaleString() || "5,000"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Paying this off first will give you momentum
                </p>
              </div>
            </div>
          </motion.div>

          {/* Monthly Interest Cost */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-purple-50 p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <PiggyBank className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Monthly Interest Cost</h3>
                <p className="font-medium mt-2">
                  {currencySymbol}
                  {monthlyInterest.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {" "}per month
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  This is what your debt costs you monthly
                </p>
              </div>
            </div>
          </motion.div>

          {/* Optimization Potential */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <LineChart className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Optimization Potential</h3>
                <p className="font-medium mt-2">{optimizationScore}% room for improvement</p>
                <p className="text-sm text-gray-600 mt-1">
                  Based on your current payment strategy
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommended Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-primary/5 p-6 rounded-lg"
        >
          <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Recommended Next Steps
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary mt-1" />
              <p className="text-gray-600">Consider consolidating your high-interest debts to reduce overall interest costs</p>
            </div>
            <div className="flex items-start gap-3">
              <ArrowUpRight className="h-5 w-5 text-primary mt-1" />
              <p className="text-gray-600">Look for opportunities to increase your monthly payment by {currencySymbol}50-100</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <p className="text-gray-600">Set up automatic payments to ensure consistent debt reduction</p>
            </div>
            <div className="flex items-start gap-3">
              <Percent className="h-5 w-5 text-primary mt-1" />
              <p className="text-gray-600">You have high-interest debt(s). Prioritize paying these off first</p>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
