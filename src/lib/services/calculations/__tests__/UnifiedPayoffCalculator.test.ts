import { UnifiedPayoffCalculator } from '../UnifiedPayoffCalculator';
import { strategies } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';

describe('UnifiedPayoffCalculator', () => {
  const mockDebts = [
    {
      id: '1',
      name: 'Credit Card 1',
      balance: 1000,
      interest_rate: 20,
      minimum_payment: 50,
      user_id: 'user1',
      banker_name: 'Bank A',
      created_at: new Date(),
      updated_at: new Date(),
      currency_symbol: '£',
      category: 'Credit Card',
      status: 'active'
    }
  ];

  it('calculates baseline scenario correctly', () => {
    const result = UnifiedPayoffCalculator.calculatePayoff(
      mockDebts,
      50,
      strategies[0],
      []
    );

    expect(result.baselineMonths).toBeGreaterThan(0);
    expect(result.baselineInterest).toBeGreaterThan(0);
    expect(result.monthsSaved).toBe(0);
    expect(result.interestSaved).toBe(0);
  });

  it('calculates accelerated scenario with one-time funding correctly', () => {
    const oneTimeFundings: OneTimeFunding[] = [
      {
        id: '1',
        user_id: 'user1',
        payment_date: new Date().toISOString(),
        amount: 500,
        notes: 'Test funding',
        is_applied: false,
        currency_symbol: '£'
      }
    ];

    const result = UnifiedPayoffCalculator.calculatePayoff(
      mockDebts,
      100,
      strategies[0],
      oneTimeFundings
    );

    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.interestSaved).toBeGreaterThan(0);
  });
});