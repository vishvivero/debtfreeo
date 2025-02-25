
import { Debt } from "@/lib/types";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { useProfile } from "@/hooks/use-profile";
import { strategies } from "@/lib/strategies";
import { PayoffTimelineContainer } from "./timeline/PayoffTimelineContainer";
import { Loader2 } from "lucide-react";

interface PayoffTimelineProps {
  debts: Debt[];
  extraPayment: number;
}

export const PayoffTimeline = ({ debts, extraPayment }: PayoffTimelineProps) => {
  const { oneTimeFundings } = useOneTimeFunding();
  const { profile, isLoading: isProfileLoading } = useProfile();
  
  if (isProfileLoading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!debts?.length) {
    console.log('No debts available:', { 
      debtCount: debts?.length, 
      hasProfile: !!profile 
    });
    return null;
  }

  // Calculate total minimum payment and ensure it's valid
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalMonthlyPayment = Math.max(totalMinimumPayment, totalMinimumPayment + extraPayment);

  const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];
  console.log('PayoffTimeline render:', {
    debtsCount: debts.length,
    extraPayment,
    totalMinimumPayment,
    totalMonthlyPayment,
    selectedStrategy: selectedStrategy.name
  });

  // Don't render if we don't have valid payment amounts
  if (totalMonthlyPayment <= 0) {
    console.error('Invalid monthly payment amount:', totalMonthlyPayment);
    return null;
  }

  return (
    <PayoffTimelineContainer
      debts={debts}
      extraPayment={extraPayment}
      strategy={selectedStrategy}
      oneTimeFundings={oneTimeFundings}
      monthlyPayment={totalMonthlyPayment}
    />
  );
};
