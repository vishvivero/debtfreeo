
import { Debt } from "@/lib/types";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { useProfile } from "@/hooks/use-profile";
import { strategies } from "@/lib/strategies";
import { PayoffTimelineContainer } from "./timeline/PayoffTimelineContainer";

interface PayoffTimelineProps {
  debts: Debt[];
  extraPayment: number;
}

export const PayoffTimeline = ({ debts, extraPayment }: PayoffTimelineProps) => {
  const { oneTimeFundings } = useOneTimeFunding();
  const { profile } = useProfile();
  
  if (!debts?.length || !profile) {
    console.log('No debts or profile available:', { 
      debtCount: debts?.length, 
      hasProfile: !!profile 
    });
    return null;
  }

  const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];

  return (
    <PayoffTimelineContainer
      debts={debts}
      extraPayment={extraPayment}
      strategy={selectedStrategy}
      oneTimeFundings={oneTimeFundings}
    />
  );
};
