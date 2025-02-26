
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDebts } from "@/hooks/use-debts";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { strategies } from "@/lib/strategies";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import { DebtOverviewCard } from "./comparison/DebtOverviewCard";
import { OptimizedPlanCard } from "./comparison/OptimizedPlanCard";

export const DebtComparison = () => {
  const { debts, profile } = useDebts();
  const { oneTimeFundings } = useOneTimeFunding();
  const navigate = useNavigate();
  const currencySymbol = profile?.preferred_currency || "£";

  const calculateComparison = () => {
    if (!debts || debts.length === 0 || !profile?.monthly_payment) {
      return {
        totalDebts: 0,
        originalPayoffDate: new Date(),
        originalTotalInterest: 0,
        optimizedPayoffDate: new Date(),
        optimizedTotalInterest: 0,
        timeSaved: { years: 0, months: 0 },
        moneySaved: 0,
        baselineYears: 0,
        baselineMonths: 0,
        principalPercentage: 0,
        interestPercentage: 0
      };
    }

    console.log('Calculating comparison with one-time fundings:', oneTimeFundings);

    const selectedStrategy = strategies.find(s => s.id === profile.selected_strategy) || strategies[0];
    
    const timelineData = calculateTimelineData(
      debts,
      profile.monthly_payment,
      selectedStrategy,
      oneTimeFundings
    );

    const lastDataPoint = timelineData[timelineData.length - 1];
    
    const acceleratedPayoffPoint = timelineData.find(d => d.acceleratedBalance <= 0);
    const optimizedPayoffDate = acceleratedPayoffPoint 
      ? new Date(acceleratedPayoffPoint.date)
      : new Date(lastDataPoint.date);

    const totalPayment = lastDataPoint.baselineInterest + debts.reduce((sum, debt) => sum + debt.balance, 0);
    const interestPercentage = (lastDataPoint.baselineInterest / totalPayment) * 100;
    const principalPercentage = 100 - interestPercentage;

    const baselineMonths = timelineData.length;
    const baselineYears = Math.floor(baselineMonths / 12);
    const remainingMonths = baselineMonths % 12;

    const totalBaselineMonths = baselineMonths;
    const totalAcceleratedMonths = timelineData.find(d => d.acceleratedBalance <= 0) 
      ? timelineData.findIndex(d => d.acceleratedBalance <= 0) 
      : baselineMonths;
    const monthsSaved = Math.max(0, totalBaselineMonths - totalAcceleratedMonths);
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonthsSaved = monthsSaved % 12;

    return {
      totalDebts: debts.length,
      originalPayoffDate: new Date(lastDataPoint.date),
      originalTotalInterest: lastDataPoint.baselineInterest,
      optimizedPayoffDate,
      optimizedTotalInterest: lastDataPoint.acceleratedInterest,
      timeSaved: { 
        years: yearsSaved,
        months: remainingMonthsSaved 
      },
      moneySaved: lastDataPoint.baselineInterest - lastDataPoint.acceleratedInterest,
      baselineYears,
      baselineMonths: remainingMonths,
      principalPercentage,
      interestPercentage
    };
  };

  const comparison = calculateComparison();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 px-4 sm:px-6 lg:px-0"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DebtOverviewCard
          comparison={comparison}
          currencySymbol={currencySymbol}
          debts={debts}
        />
        <OptimizedPlanCard
          comparison={comparison}
          currencySymbol={currencySymbol}
        />
      </div>
    </motion.div>
  );
};
