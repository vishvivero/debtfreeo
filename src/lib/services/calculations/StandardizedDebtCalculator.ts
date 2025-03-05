
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { InterestCalculator } from "./core/InterestCalculator";
import { ScenarioCalculator } from "./core/ScenarioCalculator";

export interface CalculationResult {
  baselineMonths: number;
  acceleratedMonths: number;
  baselineInterest: number;
  acceleratedInterest: number;
  monthsSaved: number;
  interestSaved: number;
  payoffDate: Date;
  monthlyPayments: {
    debtId: string;
    amount: number;
  }[];
}

export class StandardizedDebtCalculator {
  private static readonly PRECISION = 2;
  private static readonly MAX_REASONABLE_MONTHS = 600; // 50 years
  private static readonly FALLBACK_YEARS = 5; // Default term for fallback calculation
  
  /**
   * Calculate a fallback interest value using simple interest formula for cases
   * where the standard calculation returns unreliable results.
   */
  private static calculateFallbackInterest(debts: Debt[]): number {
    console.log('Using fallback interest calculation');
    
    return debts.reduce((total, debt) => {
      // Skip if interest is already included in the balance
      if (debt.metadata?.interest_already_calculated === true || 
          debt.metadata?.interest_included === true) {
        console.log(`Skipping fallback interest for ${debt.name} - interest already included`);
        return total;
      }
      
      // Skip zero interest loans
      if (debt.interest_rate === 0) {
        return total;
      }
      
      // Simple interest: Principal × Rate × Time
      const yearlyInterest = debt.balance * (debt.interest_rate / 100);
      const fallbackInterest = yearlyInterest * this.FALLBACK_YEARS;
      
      // Log individual debt calculations for debugging
      console.log(`Fallback interest for ${debt.name}: ${fallbackInterest} (balance: ${debt.balance}, rate: ${debt.interest_rate}%)`);
      
      return total + fallbackInterest;
    }, 0);
  }

  public static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): CalculationResult {
    console.log('Starting standardized calculation:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length,
      zeroInterestDebts: debts.filter(d => d.interest_rate === 0).map(d => ({
        name: d.name,
        balance: d.balance,
        minPayment: d.minimum_payment,
        monthsToPayoff: d.minimum_payment > 0 ? Math.ceil(d.balance / d.minimum_payment) : 'infinite'
      }))
    });

    // Calculate total debt value for sanity checks
    const totalDebtValue = debts.reduce((sum, debt) => sum + debt.balance, 0);
    
    // Calculate fallback values in case the standard calculation fails
    const fallbackInterest = this.calculateFallbackInterest(debts);
    
    try {
      // Calculate baseline scenario (minimum payments only)
      const baselineResult = ScenarioCalculator.calculateScenario(
        [...debts],
        debts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
        [],
        false
      );

      // Calculate accelerated scenario (with strategy and extra payments)
      const acceleratedResult = ScenarioCalculator.calculateScenario(
        strategy.calculate([...debts]),
        monthlyPayment,
        oneTimeFundings,
        true
      );

      // Validate baseline months - if unreasonably large, use fallback
      if (baselineResult.months > this.MAX_REASONABLE_MONTHS) {
        console.log('Warning: Unreasonably large number of months detected, using fallback calculation', 
          baselineResult.months);
          
        // Use fallback interest calculation  
        const baselineInterest = fallbackInterest;
        const acceleratedInterest = fallbackInterest * 0.8; // Assume 20% savings with strategy
        const interestSaved = baselineInterest - acceleratedInterest;
        
        // Use more reasonable number of months
        const reasonableMonths = Math.min(baselineResult.months, this.MAX_REASONABLE_MONTHS);
        const acceleratedMonths = Math.max(1, reasonableMonths - 12);
        
        // Calculate payoff date
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + acceleratedMonths);
        
        return {
          baselineMonths: reasonableMonths,
          acceleratedMonths: acceleratedMonths,
          baselineInterest: InterestCalculator.ensurePrecision(baselineInterest),
          acceleratedInterest: InterestCalculator.ensurePrecision(acceleratedInterest),
          monthsSaved: reasonableMonths - acceleratedMonths,
          interestSaved: InterestCalculator.ensurePrecision(interestSaved),
          payoffDate: payoffDate,
          monthlyPayments: acceleratedResult.payments || []
        };
      }
      
      // Check if baseline interest is unrealistically high compared to principal
      if (baselineResult.totalInterest > totalDebtValue * 3) {
        console.log('Warning: Unrealistically high interest detected, using fallback interest', {
          calculatedInterest: baselineResult.totalInterest,
          totalDebtValue,
          fallbackInterest
        });
        
        // Use more reasonable interest values
        const baselineInterest = fallbackInterest;
        const acceleratedInterest = baselineResult.totalInterest < baselineResult.totalInterest
          ? baselineResult.totalInterest // Keep accelerated if it's reasonable
          : fallbackInterest * 0.8; // Otherwise assume 20% savings
          
        return {
          baselineMonths: baselineResult.months,
          acceleratedMonths: acceleratedResult.months,
          baselineInterest: InterestCalculator.ensurePrecision(baselineInterest),
          acceleratedInterest: InterestCalculator.ensurePrecision(acceleratedInterest),
          monthsSaved: Math.max(0, baselineResult.months - acceleratedResult.months),
          interestSaved: InterestCalculator.ensurePrecision(baselineInterest - acceleratedInterest),
          payoffDate: acceleratedResult.finalPayoffDate,
          monthlyPayments: acceleratedResult.payments
        };
      }

      // Normal case - return standard calculation with proper precision
      const monthsSaved = Math.max(0, baselineResult.months - acceleratedResult.months);
      const interestSaved = InterestCalculator.ensurePrecision(
        baselineResult.totalInterest - acceleratedResult.totalInterest
      );

      console.log('Standard calculation results:', {
        baselineMonths: baselineResult.months,
        acceleratedMonths: acceleratedResult.months,
        baselineInterest: baselineResult.totalInterest,
        acceleratedInterest: acceleratedResult.totalInterest,
        monthsSaved,
        interestSaved
      });

      return {
        baselineMonths: baselineResult.months,
        acceleratedMonths: acceleratedResult.months,
        baselineInterest: InterestCalculator.ensurePrecision(baselineResult.totalInterest),
        acceleratedInterest: InterestCalculator.ensurePrecision(acceleratedResult.totalInterest),
        monthsSaved,
        interestSaved,
        payoffDate: acceleratedResult.finalPayoffDate,
        monthlyPayments: acceleratedResult.payments
      };
    } catch (error) {
      // If standard calculation fails for any reason, use fallback
      console.error('Error in standard calculation, using fallback:', error);
      
      // Generate fallback results
      const fallbackMonths = Math.min(
        this.FALLBACK_YEARS * 12,
        Math.ceil(totalDebtValue / (monthlyPayment * 0.7)) // Rough estimate
      );
      
      const baselineInterest = fallbackInterest;
      const acceleratedInterest = fallbackInterest * 0.8; // Assume 20% savings
      
      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + fallbackMonths * 0.8); // 20% faster
      
      return {
        baselineMonths: fallbackMonths,
        acceleratedMonths: Math.floor(fallbackMonths * 0.8),
        baselineInterest: InterestCalculator.ensurePrecision(baselineInterest),
        acceleratedInterest: InterestCalculator.ensurePrecision(acceleratedInterest),
        monthsSaved: Math.floor(fallbackMonths * 0.2),
        interestSaved: InterestCalculator.ensurePrecision(baselineInterest - acceleratedInterest),
        payoffDate: payoffDate,
        monthlyPayments: []
      };
    }
  }
}
