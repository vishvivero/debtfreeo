import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Flame } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";

export const DebtFreeCountdown = () => {
  const { debts, profile } = useDebts();
  const { oneTimeFundings } = useOneTimeFunding();
  
  const getYearsAndMonths = (date: Date) => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    const years = Math.floor(Math.max(0, monthsDiff) / 12);
    const months = Math.max(0, monthsDiff) % 12;
    return { years, months };
  };

  const calculateProjectedPayoffDate = () => {
    if (!debts || debts.length === 0 || !profile?.monthly_payment) return undefined;

    // Convert oneTimeFundings to the correct format with Date objects
    const formattedFundings = oneTimeFundings.map(funding => ({
      amount: funding.amount,
      payment_date: new Date(funding.payment_date)
    }));

    const selectedStrategy = strategies.find(s => s.id === profile.selected_strategy) || strategies[0];
    const payoffDetails = unifiedDebtCalculationService.calculatePayoffDetails(
      debts,
      profile.monthly_payment,
      selectedStrategy,
      formattedFundings
    );

    let maxPayoffDate = new Date();
    Object.values(payoffDetails).forEach(detail => {
      if (detail.payoffDate > maxPayoffDate) {
        maxPayoffDate = detail.payoffDate;
      }
    });

    return maxPayoffDate;
  };

  const projectedPayoffDate = calculateProjectedPayoffDate();
  const countdown = projectedPayoffDate ? getYearsAndMonths(projectedPayoffDate) : undefined;

  return (
    <Card className="w-full bg-white shadow-lg mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-[#107A57]">DEBT-FREE COUNTDOWN</CardTitle>
          <div className="w-12 h-12 bg-[#34D399]/10 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#34D399]" />
          </div>
        </div>
        {projectedPayoffDate ? (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Projected debt-free date</p>
            <p className="text-lg font-semibold text-[#111827]">
              {projectedPayoffDate.toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center p-3 bg-[#E5E7EB] rounded-lg flex-1">
                <div className="text-2xl font-bold text-[#111827]">{countdown?.years}</div>
                <div className="text-sm text-gray-600">{countdown?.years === 1 ? 'year' : 'years'}</div>
              </div>
              <div className="text-center p-3 bg-[#E5E7EB] rounded-lg flex-1">
                <div className="text-2xl font-bold text-[#111827]">{countdown?.months}</div>
                <div className="text-sm text-gray-600">{countdown?.months === 1 ? 'month' : 'months'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center p-6">
            <p className="text-gray-500">No projected payoff date available</p>
          </div>
        )}
      </CardHeader>
    </Card>
  );
};