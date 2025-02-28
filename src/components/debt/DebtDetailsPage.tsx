
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDebts } from "@/hooks/use-debts";
import { strategies } from "@/lib/strategies";
import { MainLayout } from "@/components/layout/MainLayout";
import { PayoffTimeline } from "./PayoffTimeline";
import { AmortizationTable } from "./AmortizationTable";
import { DebtHeroSection } from "./details/DebtHeroSection";
import { PaymentOverview } from "./details/PaymentOverview";
import { CurrencyToggle } from "./details/CurrencyToggle";
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
import { convertCurrency } from "@/lib/utils/currencyConverter";

export const DebtDetailsPage = () => {
  const { debtId } = useParams();
  const { debts } = useDebts();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const debt = debts?.find(d => d.id === debtId);
  
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(debt?.minimum_payment || 0);
  const [useNativeCurrency, setUseNativeCurrency] = useState(true);

  if (!debt || !profile) {
    console.log('Debt not found for id:', debtId);
    return <div>Debt not found</div>;
  }

  // Use the selected strategy from profile, defaulting to 'avalanche' if not set
  const selectedStrategyId = profile?.selected_strategy || 'avalanche';
  const strategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];

  // Determine which currency symbol to use based on toggle state
  const debtCurrency = debt.currency_symbol || '£';
  const profileCurrency = profile.preferred_currency || '£';
  const currencySymbol = useNativeCurrency ? debtCurrency : profileCurrency;
  
  // Convert values if using profile currency
  const getConvertedValue = (value: number) => {
    if (useNativeCurrency || debtCurrency === profileCurrency) {
      return value;
    }
    return convertCurrency(value, debtCurrency, profileCurrency);
  };

  const convertedBalance = getConvertedValue(debt.balance);
  const convertedMinimumPayment = getConvertedValue(debt.minimum_payment);
  const convertedTotalPaid = getConvertedValue(totalPaid);
  const convertedTotalInterest = getConvertedValue(totalInterest);
  
  const isPayable = isDebtPayable(debt);
  const minimumViablePayment = getMinimumViablePayment(debt);
  const convertedMinimumViablePayment = getConvertedValue(minimumViablePayment);

  // Create a version of the debt with converted values for display only
  // For calculations that affect dates, we'll use the original debt values
  const convertedDebt = useNativeCurrency 
    ? debt 
    : {
        ...debt,
        balance: convertedBalance,
        minimum_payment: convertedMinimumPayment,
        currency_symbol: profileCurrency
      };

  // Calculate payoff date using original debt values to ensure consistency
  const payoffInfo = calculateSingleDebtPayoff(debt, debt.minimum_payment, strategy);
  const payoffDate = payoffInfo.payoffDate;

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

      const interest = payments.reduce((sum, payment) => {
        const interestPortion = (Number(payment.total_payment) * (debt.interest_rate / 100)) / 12;
        return sum + interestPortion;
      }, 0);
      setTotalInterest(interest);

      console.log('Payment history summary:', {
        totalPaid: total,
        totalInterest: interest,
        paymentCount: payments.length,
        debtCurrency: debt.currency_symbol
      });
    };

    fetchPaymentHistory();
  }, [debt]);

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
                Your current minimum payment of {currencySymbol}{convertedMinimumPayment.toLocaleString()} is insufficient 
                to cover the monthly interest. You need to set a minimum payment of at least {currencySymbol}{convertedMinimumViablePayment.toLocaleString()} &nbsp;
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Loan Details</h1>
          <CurrencyToggle
            useNativeCurrency={useNativeCurrency}
            setUseNativeCurrency={setUseNativeCurrency}
            debtCurrency={debtCurrency}
            profileCurrency={profileCurrency}
          />
        </div>

        <DebtHeroSection 
          debt={convertedDebt}
          totalPaid={convertedTotalPaid}
          payoffDate={payoffDate} 
          currencySymbol={currencySymbol}
        />

        <Separator className="my-8" />

        <PaymentOverview
          debt={convertedDebt}
          totalPaid={convertedTotalPaid}
          totalInterest={convertedTotalInterest}
          currencySymbol={currencySymbol}
          isPayable={isPayable}
          minimumViablePayment={convertedMinimumViablePayment}
        />

        <Separator className="my-8" />

        <PayoffTimeline 
          debts={[debt]} 
          extraPayment={0}
          enableOneTimeFundings={false}
        />

        <Separator className="my-8" />

        <AmortizationTable 
          debt={convertedDebt} 
          amortizationData={calculateAmortizationSchedule(debt, debt.minimum_payment)}
          currencySymbol={currencySymbol}
        />
      </div>
    </MainLayout>
  );
};
