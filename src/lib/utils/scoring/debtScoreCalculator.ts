import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { PayoffDetails } from "@/lib/services/UnifiedDebtCalculationService";

export interface ScoreDetails {
  interestScore: number;
  durationScore: number;
  behaviorScore: {
    ontimePayments: number;
    excessPayments: number;
    strategyUsage: number;
  };
  totalScore: number;
}

export interface ScoreComponents extends ScoreDetails {}

export const calculateDebtScore = (
  debts: Debt[],
  originalPayoffDetails: { [key: string]: PayoffDetails },
  optimizedPayoffDetails: { [key: string]: PayoffDetails },
  selectedStrategy: Strategy,
  monthlyPayment: number
): ScoreComponents => {
  console.log('Calculating debt score with:', {
    totalDebts: debts.length,
    selectedStrategy: selectedStrategy.name,
    monthlyPayment
  });

  // Calculate Interest Score (50% weight)
  const calculateInterestScore = () => {
    const originalTotalInterest = Object.values(originalPayoffDetails)
      .reduce((sum, detail) => sum + detail.totalInterest, 0);
    const optimizedTotalInterest = Object.values(optimizedPayoffDetails)
      .reduce((sum, detail) => sum + detail.totalInterest, 0);

    console.log('Interest comparison:', {
      originalTotalInterest,
      optimizedTotalInterest
    });

    if (originalTotalInterest === 0) return 0;
    const interestScore = Math.min(50, (1 - (optimizedTotalInterest / originalTotalInterest)) * 50);
    return Math.max(0, interestScore);
  };

  // Calculate Duration Score (30% weight)
  const calculateDurationScore = () => {
    const getMaxMonths = (details: { [key: string]: PayoffDetails }) =>
      Math.max(...Object.values(details).map(detail => detail.months));

    const originalDuration = getMaxMonths(originalPayoffDetails);
    const optimizedDuration = getMaxMonths(optimizedPayoffDetails);

    console.log('Duration comparison:', {
      originalDuration,
      optimizedDuration
    });

    if (originalDuration === 0) return 0;
    const durationScore = Math.min(30, (1 - (optimizedDuration / originalDuration)) * 30);
    return Math.max(0, durationScore);
  };

  // Calculate Behavior Score (20% weight)
  const calculateBehaviorScore = () => {
    // Ontime Payments (10%)
    const ontimePaymentRate = 1.0; // Assuming all payments are on time for now
    const ontimeScore = ontimePaymentRate * 10;

    // Excess Payments (5%)
    const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    const excessPaymentRate = Math.min(1, Math.max(0, 
      (monthlyPayment - totalMinimumPayments) / totalMinimumPayments
    ));
    const excessScore = excessPaymentRate * 5;

    // Strategy Usage (5%)
    const strategyScore = selectedStrategy ? 5 : 0;

    console.log('Behavior scores:', {
      ontimeScore,
      excessScore,
      strategyScore
    });

    return {
      ontimePayments: ontimeScore,
      excessPayments: excessScore,
      strategyUsage: strategyScore
    };
  };

  const interestScore = calculateInterestScore();
  const durationScore = calculateDurationScore();
  const behaviorScore = calculateBehaviorScore();

  const totalScore = Math.min(100, Math.max(0,
    interestScore +
    durationScore +
    behaviorScore.ontimePayments +
    behaviorScore.excessPayments +
    behaviorScore.strategyUsage
  ));

  console.log('Final score components:', {
    interestScore,
    durationScore,
    behaviorScore,
    totalScore
  });

  return {
    interestScore,
    durationScore,
    behaviorScore,
    totalScore
  };
};

export const getScoreCategory = (score: number): {
  label: string;
  description: string;
  color: string;
} => {
  if (score >= 80) {
    return {
      label: "Excellent",
      description: "Your debt repayment plan is fully optimized for interest and duration savings.",
      color: "text-emerald-500"
    };
  } else if (score >= 60) {
    return {
      label: "Good",
      description: "Your plan is solid, but there's room for improvement in interest savings or duration.",
      color: "text-blue-500"
    };
  } else if (score >= 40) {
    return {
      label: "Average",
      description: "Consider applying more excess payments or better repayment strategies.",
      color: "text-yellow-500"
    };
  } else {
    return {
      label: "Needs Improvement",
      description: "Review your repayment plan and behavior to optimize your debt payoff journey.",
      color: "text-red-500"
    };
  }
};
