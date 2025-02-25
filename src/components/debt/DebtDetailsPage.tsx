
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  calculateSingleDebtPayoff,
  isDebtPayable,
  getMinimumViablePayment
} from "@/lib/utils/payment/standardizedCalculations";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DebtDetailsPage = () => {
  const { debtId } = useParams();
  const { debts, isLoading: isDebtsLoading } = useDebts();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const navigate = useNavigate();
  
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  console.log('DebtDetailsPage render:', { debtId, hasDebts: !!debts, hasProfile: !!profile });

  const debt = debts?.find(d => d.id === debtId);
  const selectedStrategyId = profile?.selected_strategy || 'avalanche';
  const strategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];

  useEffect(() => {
    if (debt) {
      console.log('Setting initial monthly payment:', debt.minimum_payment);
      setMonthlyPayment(debt.minimum_payment);
    }
  }, [debt]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!debt?.user_id || !debt?.id) return;

      setIsLoadingPayments(true);
      console.log('Fetching payment history for debt:', debt.id);

      try {
        const { data: payments, error } = await supabase
          .from('payment_history')
          .select('*')
          .eq('user_id', debt.user_id)
          .eq('redistributed_from', debt.id);

        if (error) {
          console.error('Error fetching payment history:', error);
          return;
        }

        if (!payments) {
          console.log('No payments found');
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
      } catch (err) {
        console.error('Error in payment history fetch:', err);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    fetchPaymentHistory();
  }, [debt]);

  // Show loading state while initial data is being fetched
  if (isDebtsLoading || isProfileLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Early return if debt or profile is not loaded
  if (!debt || !profile) {
    console.log('Required data not loaded:', { hasDebt: !!debt, hasProfile: !!profile, debtId });
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Debt not found</h2>
            <p className="mt-2 text-gray-600">The requested debt could not be found.</p>
            <Button 
              onClick={() => navigate('/overview/debts')}
              className="mt-4 bg-primary hover:bg-primary/90 text-white"
            >
              Return to Debts Overview
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isPayable = isDebtPayable(debt);
  const minimumViablePayment = getMinimumViablePayment(debt);
  const currencySymbol = profile.preferred_currency || '£';

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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <DebtHeroSection 
          debt={debt}
          totalPaid={totalPaid}
          payoffDate={calculateSingleDebtPayoff(debt, monthlyPayment, strategy).payoffDate}
          currencySymbol={currencySymbol}
        />

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

        {isLoadingPayments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <AmortizationTable 
            debt={debt} 
            amortizationData={calculateAmortizationSchedule(debt, monthlyPayment)}
            currencySymbol={currencySymbol}
          />
        )}
      </div>
    </MainLayout>
  );
};
