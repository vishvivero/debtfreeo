import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDebts } from "@/hooks/use-debts";
import { strategies } from "@/lib/strategies";
import { MainLayout } from "@/components/layout/MainLayout";
import { PayoffTimeline } from "./PayoffTimeline";
import { AmortizationTable } from "./AmortizationTable";
import { DebtHeroSection } from "./details/DebtHeroSection";
import { PaymentOverview } from "./details/PaymentOverview";
import { GoldLoanWarning } from "./GoldLoanWarning";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { 
  calculateAmortizationSchedule, 
  calculateSingleDebtPayoff,
  isDebtPayable,
  getMinimumViablePayment
} from "@/lib/utils/payment/standardizedCalculations";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

const calculateMonthlyGoldLoanPayment = (debt: any) => {
  console.log('Starting payment calculation for debt:', {
    name: debt.name,
    isGoldLoan: debt.is_gold_loan,
    balance: debt.balance,
    interestRate: debt.interest_rate
  });

  // Early return if not a gold loan
  if (!debt.is_gold_loan) {
    console.log('Not a gold loan, returning minimum payment:', debt.minimum_payment);
    return debt.minimum_payment;
  }

  // For gold loans, calculate the monthly interest payment
  const monthlyInterestRate = debt.interest_rate / 100 / 12; // Convert annual percentage to monthly decimal
  const monthlyInterestPayment = Number((debt.balance * monthlyInterestRate).toFixed(2));

  console.log('Gold loan payment calculation details:', {
    balance: debt.balance,
    annualRate: debt.interest_rate,
    monthlyRate: monthlyInterestRate,
    monthlyPayment: monthlyInterestPayment,
    isGoldLoan: debt.is_gold_loan,
    hasLoanTerm: !!debt.loan_term_months
  });

  return monthlyInterestPayment;
};

export const DebtDetailsPage = () => {
  // 1. Hooks at the top
  const { debtId } = useParams();
  const { debts } = useDebts();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  // 2. Data derivation
  const debt = debts?.find(d => d.id === debtId);
  const currencySymbol = profile?.preferred_currency || '£';

  // 3. Effects
  useEffect(() => {
    if (debt) {
      console.log('Debt found, calculating payment:', {
        debtId,
        debtName: debt.name,
        isGoldLoan: debt.is_gold_loan,
        balance: debt.balance,
        interestRate: debt.interest_rate
      });

      const payment = calculateMonthlyGoldLoanPayment(debt);
      
      console.log('Monthly payment calculation result:', {
        calculatedPayment: payment,
        typeof: typeof payment,
        isNumber: !isNaN(payment)
      });

      // Force payment to be a number and ensure it's not NaN
      const finalPayment = !isNaN(payment) ? Number(payment) : 0;
      setMonthlyPayment(finalPayment);

      console.log('Final monthly payment set to:', finalPayment);
    }
  }, [debt, debtId]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!debt?.id || !debt.user_id) return;
      
      console.log('Fetching payment history for debt:', debt.id);

      const { data: payments, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', debt.user_id)
        .eq('redistributed_from', debt.id);

      if (error) {
        console.error('Error fetching payment history:', error);
        return;
      }

      const total = payments.reduce((sum, payment) => sum + Number(payment.total_payment), 0);
      setTotalPaid(total);

      const interest = payments.reduce((sum, payment) => {
        const interestPortion = (Number(payment.total_payment) * (debt.interest_rate / 100)) / 12;
        return sum + interestPortion;
      }, 0);
      setTotalInterest(interest);

      console.log('Payment history summary:', {
        totalPaid: total,
        totalInterest: interest,
        paymentCount: payments.length
      });
    };

    fetchPaymentHistory();
  }, [debt?.id, debt?.user_id, debt?.interest_rate]);

  // 4. Early return if data is not available
  if (!debt || !profile) {
    console.log('Early return - missing data:', { hasDebt: !!debt, hasProfile: !!profile });
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div>Debt not found</div>
        </div>
      </MainLayout>
    );
  }

  // 5. Derived calculations after data check
  const isPayable = isDebtPayable(debt);
  const minimumViablePayment = getMinimumViablePayment(debt);
  const selectedStrategyId = profile?.selected_strategy || 'avalanche';
  const strategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];

  console.log('Rendering with payment values:', {
    monthlyPayment,
    minimumViablePayment,
    isPayable,
    debtBalance: debt.balance,
    debtInterestRate: debt.interest_rate
  });

  if (!isPayable) {
    return (
      <Dialog open={true} onOpenChange={() => navigate('/overview/debts')}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6">
          <DialogHeader>
            <div className="flex items-center justify-center text-red-500 mb-4">
              <Ban size={48} className="animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              Cannot View Debt Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Minimum Payment Insufficient</AlertTitle>
              <AlertDescription className="mt-2">
                Your current minimum payment of {currencySymbol}{debt.minimum_payment.toLocaleString()} is insufficient 
                to cover the monthly interest. You need to set a minimum payment of at least {currencySymbol}{minimumViablePayment.toLocaleString()} &nbsp;
                to make progress on this debt.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/overview/debts')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Return to Debts Overview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 6. Main render
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <DebtHeroSection 
          debt={debt}
          totalPaid={totalPaid}
          payoffDate={calculateSingleDebtPayoff(debt, monthlyPayment, strategy).payoffDate}
          currencySymbol={currencySymbol}
        />

        {debt.is_gold_loan && debt.loan_term_months && (
          <GoldLoanWarning
            principalAmount={debt.balance}
            currencySymbol={currencySymbol}
            paymentDate={debt.final_payment_date || ''}
          />
        )}

        <Separator className="my-8" />

        <PaymentOverview
          debt={debt}
          totalPaid={totalPaid}
          totalInterest={totalInterest}
          currencySymbol={currencySymbol}
          isPayable={isPayable}
          minimumViablePayment={minimumViablePayment}
        />

        <Separator className="my-8" />

        <PayoffTimeline 
          debts={[debt]}
          extraPayment={monthlyPayment - debt.minimum_payment}
        />

        <Separator className="my-8" />

        <AmortizationTable 
          debt={debt} 
          amortizationData={calculateAmortizationSchedule(debt, monthlyPayment)}
          currencySymbol={currencySymbol}
        />
      </div>
    </MainLayout>
  );
};
