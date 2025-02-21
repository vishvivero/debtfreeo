
import { ScoreInsightsContainer } from "./insights/ScoreInsightsContainer";
import { PayoffTimelineSection } from "./payoff/PayoffTimelineSection";
import { Debt } from "@/lib/types";

interface ResultsSectionProps {
  hasViewedResults: boolean;
  debts: Debt[];
  extraPayment: number;
}

export const ResultsSection = ({
  hasViewedResults,
  debts,
  extraPayment,
}: ResultsSectionProps) => {
  if (!hasViewedResults) return null;

  return (
    <>
      <ScoreInsightsContainer />
      <PayoffTimelineSection debts={debts} extraPayment={extraPayment} />
    </>
  );
};
