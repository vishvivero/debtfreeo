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
import { AlertTriangle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  const [useOriginalCurrency, setUseOriginalCurrency] = useState(false);

  if (!debt || !profile) {
    console.log('Debt not found for id:', debtId);
    return <div>Debt not found</div>;
  }

  const isPayable = isDebtPayable(debt);
  const minimumViablePayment = getMinimumViablePayment(debt);
  
  // Either use original currency or preferred currency based on toggle
  const currencySymbol = useOriginalCurrency ? debt.currency_symbol : (profile.preferred_currency || '£');
  
  // Convert values if needed
  const displayBalance = useOriginalCurrency ? 
    debt.balance : 
    convertCurrency(debt.balance, debt.currency_symbol, currencySymbol);
    
  const displayMinimumPayment = useOriginalCurrency ? 
    debt.minimum_payment : 
    convertCurrency(debt.minimum_payment, debt.currency_symbol, currencySymbol);

  // Calculate amortization schedule with proper currency conversion
  const amortizationData = calculateAmortizationSchedule(debt, monthlyPayment);
  // If not using original currency, convert all monetary values
  const convertedAmortizationData = useOriginalCurrency 
    ? amortizationData 
    : amortizationData.map(row => ({
        ...row,
        payment: convertCurrency(row.payment, debt.currency_symbol, currencySymbol),
        principalPayment: convertCurrency(row.principalPayment, debt.currency_symbol, currencySymbol),
        interestPayment: convertCurrency(row.interestPayment, debt.currency_symbol, currencySymbol),
        remainingBalance: convertCurrency(row.remainingBalance, debt.currency_symbol, currencySymbol)
      }));

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
        paymentCount: payments.length
      });
    };

    fetchPaymentHistory();
  }, [debt]);

  // Use the selected strategy from profile, defaulting to 'avalanche' if not set
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Currency Toggle */}
        <div className="flex items-center justify-end space-x-2">
          <Label htmlFor="currency-toggle" className="cursor-pointer text-sm text-gray-600">
            {useOriginalCurrency ? 
              `Showing in original currency (${debt.currency_symbol})` : 
              `Showing in preferred currency (${profile.preferred_currency || '£'})`}
          </Label>
          <Switch 
            id="currency-toggle" 
            checked={useOriginalCurrency} 
            onCheckedChange={setUseOriginalCurrency}
          />
        </div>

        <DebtHeroSection 
          debt={debt}
          totalPaid={totalPaid}
          payoffDate={calculateSingleDebtPayoff(debt, monthlyPayment, strategy).payoffDate}
          currencySymbol={currencySymbol}
          isOriginalCurrency={useOriginalCurrency}
        />

        <Separator className="my-8" />

        <PaymentOverview
          debt={{
            ...debt,
            balance: displayBalance,
            minimum_payment: displayMinimumPayment
          }}
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
          enableOneTimeFundings={false} // Explicitly disable one-time fundings for individual debt view
        />

        <Separator className="my-8" />

        <AmortizationTable 
          debt={{
            ...debt,
            balance: displayBalance,
            minimum_payment: displayMinimumPayment
          }}
          amortizationData={convertedAmortizationData}
          currencySymbol={currencySymbol}
          displayInitialBalance={useOriginalCurrency ? debt.balance : displayBalance}
        />
      </div>
    </MainLayout>
  );
};
