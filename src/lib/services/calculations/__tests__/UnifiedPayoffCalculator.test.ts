import { UnifiedPayoffCalculator } from '../UnifiedPayoffCalculator';
import { Debt } from '@/lib/types';
import { strategies } from '@/lib/strategies';

describe('UnifiedPayoffCalculator', () => {
  const mockDebts: Debt[] = [
    {
      id: '1',
      name: 'Credit Card 1',
      banker_name: 'Bank A',
      balance: 1000,
      interest_rate: 20,
      minimum_payment: 50,
      currency_symbol: '£',
      status: 'active'
    },
    {
      id: '2',
      name: 'Credit Card 2',
      banker_name: 'Bank B',
      balance: 2000,
      interest_rate: 15,
      minimum_payment: 75,
      currency_symbol: '£',
      status: 'active'
    }
  ];

  it('should calculate baseline and accelerated scenarios correctly', () => {
    const result = UnifiedPayoffCalculator.calculatePayoff(
      mockDebts,
      200,
      strategies[0],
      []
    );

    expect(result.baselineMonths).toBeGreaterThan(0);
    expect(result.acceleratedMonths).toBeLessThan(result.baselineMonths);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
  });

  it('should handle one-time fundings correctly', () => {
    const oneTimeFundings = [{
      payment_date: new Date().toISOString(),
      amount: 500
    }];

    const resultWithFunding = UnifiedPayoffCalculator.calculatePayoff(
      mockDebts,
      200,
      strategies[0],
      oneTimeFundings
    );

    const resultWithoutFunding = UnifiedPayoffCalculator.calculatePayoff(
      mockDebts,
      200,
      strategies[0],
      []
    );

    expect(resultWithFunding.acceleratedMonths).toBeLessThan(resultWithoutFunding.acceleratedMonths);
    expect(resultWithFunding.interestSaved).toBeGreaterThan(resultWithoutFunding.interestSaved);
  });
});