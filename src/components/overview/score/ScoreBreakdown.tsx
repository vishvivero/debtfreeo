
import { ScoreComponents } from "@/lib/utils/scoring/debtScoreCalculator";

interface ScoreBreakdownProps {
  scoreDetails: ScoreComponents;
}

export const ScoreBreakdown = ({ scoreDetails }: ScoreBreakdownProps) => {
  if (!scoreDetails) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
        Your Optimized Debt Repayment Strategy
      </h3>
      <p className="text-gray-600 mt-2">
        We've analyzed your debts and created a plan to minimize interest and accelerate your path to financial freedom.
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50/50 rounded-lg">
          <div className="text-gray-600">Interest Savings</div>
          <div className="text-lg font-semibold text-emerald-600">
            {scoreDetails.interestScore.toFixed(1)}/50
          </div>
        </div>
        <div className="p-4 bg-blue-50/50 rounded-lg">
          <div className="text-gray-600">Duration Reduction</div>
          <div className="text-lg font-semibold text-blue-600">
            {scoreDetails.durationScore.toFixed(1)}/30
          </div>
        </div>
        <div className="p-4 bg-purple-50/50 rounded-lg">
          <div className="text-gray-600">Payment Behavior</div>
          <div className="text-lg font-semibold text-purple-600">
            {(scoreDetails.behaviorScore.ontimePayments + 
              scoreDetails.behaviorScore.excessPayments + 
              scoreDetails.behaviorScore.strategyUsage).toFixed(1)}/20
          </div>
        </div>
      </div>
    </div>
  );
};
