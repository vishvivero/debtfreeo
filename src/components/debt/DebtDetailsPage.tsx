
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
import { GoldLoanChart } from "./chart/GoldLoanChart";
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

export const DebtDetailsPage = () => {
  const { debtId } = useParams();
  const { debts } = useDebts();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const debt = debts?.find(d => d.id === debtId);
  const currencySymbol = profile?.preferred_currency || '£';

  useEffect(() => {
    if (debt?.minimum_payment) {
      setMonthlyPayment(debt.minimum_payment);
    }
  }, [debt?.minimum_payment]);

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

  if (!debt || !profile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div>Debt not found</div>
        </div>
      </MainLayout>
    );
  }

  const isPayable = debt.is_gold_loan ? true : isDebtPayable(debt);
  const minimumViablePayment = getMinimumViablePayment(debt);
  const selectedStrategyId = profile?.selected_strategy || 'avalanche';
  const strategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];

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

  const calculateMonthlyInterest = (balance: number, interestRate: number): number => {
    return Number(((balance * interestRate) / 100 / 12).toFixed(2));
  };

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
          <>
            <GoldLoanWarning
              principalAmount={debt.balance}
              currencySymbol={currencySymbol}
              paymentDate={debt.final_payment_date || ''}
              monthlyInterest={calculateMonthlyInterest(debt.balance, debt.interest_rate)}
            />

            <GoldLoanChart 
              balance={debt.balance}
              interestRate={debt.interest_rate}
              loanTerm={debt.loan_term_months}
              currencySymbol={currencySymbol}
              finalPaymentDate={debt.final_payment_date || ''}
            />
          </>
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
