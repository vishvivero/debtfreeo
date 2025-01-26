import { motion } from "framer-motion";
import { Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";

interface NextStepsLayoutProps {
  monthlyPayment: number;
  minimumPayment: number;
  extraPayment: number;
  oneTimeFundings: OneTimeFunding[];
  currencySymbol?: string;
}

export const NextStepsLayout = ({
  monthlyPayment,
  minimumPayment,
  extraPayment,
  oneTimeFundings,
  currencySymbol = '£'
}: NextStepsLayoutProps) => {
  const sortedFundings = [...oneTimeFundings].sort(
    (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Next Steps</h3>
      
      {/* Monthly Payment Breakdown */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-white rounded-lg border space-y-3"
      >
        <h4 className="font-semibold text-gray-900">Monthly Payment Breakdown</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Minimum Required:</p>
            <p className="text-lg font-semibold">{formatCurrency(minimumPayment, currencySymbol)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Extra Payment:</p>
            <p className="text-lg font-semibold text-emerald-600">
              {formatCurrency(extraPayment, currencySymbol)}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">Total Monthly Commitment:</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(monthlyPayment, currencySymbol)}
          </p>
        </div>
      </motion.div>

      {/* Lump Sum Payments Schedule */}
      {sortedFundings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white rounded-lg border"
        >
          <h4 className="font-semibold text-gray-900 mb-3">Lump Sum Payment Schedule</h4>
          <div className="space-y-3">
            {sortedFundings.map((funding, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(funding.payment_date).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <span className="font-semibold text-purple-600">
                  {formatCurrency(funding.amount, currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};