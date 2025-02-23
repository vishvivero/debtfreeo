
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
  getMinimumViablePayment,
  AmortizationEntry
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

  const formatNumber = (num: number): string => {
    return Number(num.toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    if (debt?.minimum_payment) {
      setMonthlyPayment(Number(debt.minimum_payment.toFixed(2)));
    }
  }, [debt?.minimum_payment]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!debt?.id || !debt.user_id) return;
      
      const { data: payments, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', debt.user_id)
        .eq('redistributed_from', debt.id);

      if (error) {
        console.error('Error fetching payment history:', error);
        return;
      }

      const total = Number(payments.reduce((sum, payment) => 
        sum + Number(payment.total_payment), 0).toFixed(2));
      setTotalPaid(total);

      const interest = Number(payments.reduce((sum, payment) => {
        const interestPortion = Number(((Number(payment.total_payment) * (debt.interest_rate / 100)) / 12).toFixed(2));
        return sum + interestPortion;
      }, 0).toFixed(2));
      setTotalInterest(interest);
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
  const minimumViablePayment = Number(getMinimumViablePayment(debt).toFixed(2));
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
                Your current minimum payment of {currencySymbol}{formatNumber(debt.minimum_payment)} is insufficient 
                to cover the monthly interest. You need to set a minimum payment of at least {currencySymbol}{formatNumber(minimumViablePayment)} &nbsp;
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

  const getAmortizationData = (): AmortizationEntry[] => {
    if (debt.is_gold_loan) {
      const monthlyInterest = Number(((debt.balance * debt.interest_rate) / 100 / 12).toFixed(2));
      const loanTermMonths = debt.loan_term_months || 12;
      const schedule: AmortizationEntry[] = [];
      let currentDate = new Date();

      for (let i = 0; i < loanTermMonths; i++) {
        const isLastMonth = i === loanTermMonths - 1;
        schedule.push({
          date: new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
          payment: Number(isLastMonth ? (monthlyInterest + debt.balance).toFixed(2) : monthlyInterest.toFixed(2)),
          principal: Number(isLastMonth ? debt.balance.toFixed(2) : "0"),
          interest: monthlyInterest,
          remainingBalance: Number(isLastMonth ? "0" : debt.balance.toFixed(2)),
          startingBalance: Number(debt.balance.toFixed(2)),
          endingBalance: Number(isLastMonth ? "0" : debt.balance.toFixed(2))
        });
      }
      return schedule;
    }

    return calculateAmortizationSchedule(debt, monthlyPayment);
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
              principalAmount={Number(debt.balance.toFixed(2))}
              currencySymbol={currencySymbol}
              paymentDate={debt.final_payment_date || ''}
              monthlyInterest={Number(((debt.balance * debt.interest_rate) / 100 / 12).toFixed(2))}
            />

            <GoldLoanChart 
              balance={Number(debt.balance.toFixed(2))}
              interestRate={Number(debt.interest_rate.toFixed(2))}
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

        {!debt.is_gold_loan && (
          <>
            <PayoffTimeline 
              debts={[debt]}
              extraPayment={Number((monthlyPayment - debt.minimum_payment).toFixed(2))}
            />
            <Separator className="my-8" />
          </>
        )}

        <AmortizationTable 
          debt={debt} 
          amortizationData={getAmortizationData()}
          currencySymbol={currencySymbol}
        />
      </div>
    </MainLayout>
  );
};
