
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDebts } from "@/hooks/use-debts";
import { strategies } from "@/lib/strategies";
import { MainLayout } from "@/components/layout/MainLayout";
import { PayoffTimeline } from "./PayoffTimeline";
import { AmortizationTable } from "./AmortizationTable";
import { DebtHeroSection } from "./details/DebtHeroSection";
import { PaymentOverview } from "./details/PaymentOverview";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { 
  calculateAmortizationSchedule, 
  calculateSingleDebtPayoff 
} from "@/lib/utils/payment/standardizedCalculations";
import { Separator } from "@/components/ui/separator";

export const DebtDetailsPage = () => {
  const { debtId } = useParams();
  const { debts } = useDebts();
  const { profile } = useProfile();
  const debt = debts?.find(d => d.id === debtId);
  
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(debt?.minimum_payment || 0);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!debt) return;

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

      // Calculate interest based on this specific debt's interest rate
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
  }, [debt]);

  if (!debt || !profile) {
    console.log('Debt not found for id:', debtId);
    return <div>Debt not found</div>;
  }

  // Use the selected strategy from profile, defaulting to 'avalanche' if not set
  const selectedStrategyId = profile?.selected_strategy || 'avalanche';
  const strategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];
  const payoffDetails = calculateSingleDebtPayoff(debt, monthlyPayment, strategy);
  
  const amortizationData = calculateAmortizationSchedule(debt, monthlyPayment).map(entry => ({
    date: entry.date,
    payment: entry.payment,
    principal: entry.principal,
    interest: entry.interest,
    remainingBalance: entry.endingBalance
  }));

  const currencySymbol = profile.preferred_currency || '£';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <DebtHeroSection 
          debt={debt}
          totalPaid={totalPaid}
          payoffDate={payoffDetails.payoffDate}
          currencySymbol={currencySymbol}
        />

        <Separator className="my-8" />

        <PaymentOverview
          debt={debt}
          totalPaid={totalPaid}
          totalInterest={totalInterest}
          currencySymbol={currencySymbol}
        />

        <Separator className="my-8" />

        <PayoffTimeline 
          debts={[debt]}
          extraPayment={monthlyPayment - debt.minimum_payment}
        />

        <Separator className="my-8" />

        {amortizationData && amortizationData.length > 0 && (
          <AmortizationTable 
            debt={debt} 
            amortizationData={amortizationData}
            currencySymbol={currencySymbol}
          />
        )}
      </div>
    </MainLayout>
  );
};
