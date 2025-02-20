
export * from './debt';
export * from './payment';

export interface ScoreComponents {
  interestScore: number;
  durationScore: number;
  behaviorScore: {
    ontimePayments: number;
    excessPayments: number;
    strategyUsage: number;
  };
  totalScore: number;
}
