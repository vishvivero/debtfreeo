
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, ArrowUp, PiggyBank, LineChart, Percent } from "lucide-react";
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
      <CardContent className="space-y-6">
        {/* Priority Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <h3 className="font-semibold text-sm text-gray-600">Priority Focus</h3>
          <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Percent className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">
                Focus on {highestAprDebt?.name || "highest APR debt"} with{" "}
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
          className="space-y-2"
        >
          <h3 className="font-semibold text-sm text-gray-600">Quick Win</h3>
          <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-lg">
            <div className="p-2 bg-emerald-100 rounded-full">
              <ArrowUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium">
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
          className="space-y-2"
        >
          <h3 className="font-semibold text-sm text-gray-600">Monthly Interest Cost</h3>
          <div className="flex items-start gap-3 bg-purple-50 p-4 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <PiggyBank className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">
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
          className="space-y-2"
        >
          <h3 className="font-semibold text-sm text-gray-600">Optimization Potential</h3>
          <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
            <div className="p-2 bg-gray-100 rounded-full">
              <LineChart className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">{optimizationScore}% room for improvement</p>
              <p className="text-sm text-gray-600 mt-1">
                Based on your current payment strategy
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recommended Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="space-y-2"
        >
          <h3 className="font-semibold text-sm text-gray-600">Recommended Next Steps</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Consider consolidating your high-interest debts to reduce overall interest costs
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Look for opportunities to increase your monthly payment by {currencySymbol}50-100
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Set up automatic payments to ensure consistent debt reduction
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              You have high-interest debt(s). Prioritize paying these off first
            </li>
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  );
};
