import { useState, useEffect } from "react";
import { DebtTable } from "./DebtTable";
import { DecimalToggle } from "./DecimalToggle";
import { DeleteDebtDialog } from "./DeleteDebtDialog";
import { Debt } from "@/lib/types/debt";
import { strategies } from "@/lib/strategies";
import { calculatePayoffDetails } from "@/lib/utils/payment/paymentCalculations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/button";
import { FileDown } from "lucide-react";
import { generateDebtOverviewPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "./ui/use-toast";
import { OneTimeFunding } from "@/lib/types/payment";

interface DebtTableContainerProps {
  debts: Debt[];
  monthlyPayment?: number;
  onUpdateDebt: (updatedDebt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  currencySymbol?: string;
  selectedStrategy?: string;
}

export const DebtTableContainer = ({
  debts,
  monthlyPayment = 0,
  onUpdateDebt,
  onDeleteDebt,
  currencySymbol = '£',
  selectedStrategy = 'avalanche'
}: DebtTableContainerProps) => {
  const [showDecimals, setShowDecimals] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
  const [oneTimeFundings, setOneTimeFundings] = useState<OneTimeFunding[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('DebtTableContainer: Using currency symbol:', currencySymbol);

  const fetchOneTimeFundings = async () => {
    if (!user) return;
    
    console.log('Fetching one-time fundings for user:', user.id);
    const { data, error } = await supabase
      .from('one_time_funding')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_applied', false)
      .gte('payment_date', new Date().toISOString());

    if (error) {
      console.error('Error fetching one-time fundings:', error);
      return;
    }

    const mappedFundings: OneTimeFunding[] = data.map(funding => ({
      id: funding.id,
      user_id: funding.user_id,
      amount: funding.amount,
      payment_date: funding.payment_date,
      notes: funding.notes,
      is_applied: funding.is_applied,
      currency_symbol: funding.currency_symbol
    }));
    
    console.log('Updated one-time fundings:', mappedFundings);
    setOneTimeFundings(mappedFundings);
  };

  useEffect(() => {
    fetchOneTimeFundings();

    const channel = supabase
      .channel('one_time_funding_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'one_time_funding',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('One-time funding inserted:', payload);
          fetchOneTimeFundings();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'one_time_funding',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('One-time funding deleted:', payload);
          fetchOneTimeFundings();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'one_time_funding',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('One-time funding updated:', payload);
          fetchOneTimeFundings();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  console.log('DebtTableContainer: Calculating payoff with strategy:', selectedStrategy);
  const strategy = strategies.find(s => s.id === selectedStrategy) || strategies[0];
  
  const sortedDebts = strategy.calculate([...debts]);
  console.log('DebtTableContainer: Debts sorted according to strategy:', strategy.name);
  
  const formattedFundings = oneTimeFundings.map(funding => ({
    id: funding.id,
    user_id: funding.user_id,
    amount: funding.amount,
    payment_date: funding.payment_date,
    notes: funding.notes,
    is_applied: funding.is_applied,
    currency_symbol: funding.currency_symbol
  }));
  
  const payoffDetails = calculatePayoffDetails(sortedDebts, monthlyPayment, strategy, formattedFundings);
  console.log('DebtTableContainer: Payoff details calculated:', payoffDetails);

  const handleDownloadPDF = () => {
    try {
      const totalMinimumPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
      const extraPayment = Math.max(0, monthlyPayment - totalMinimumPayments);
      
      const doc = generateDebtOverviewPDF(
        sortedDebts,
        monthlyPayment,
        extraPayment,
        0, // baseMonths
        0, // optimizedMonths
        0, // baseTotalInterest
        0, // optimizedTotalInterest
        strategy,
        formattedFundings, // Now passing the formatted fundings with string dates
        currencySymbol
      );
      doc.save('debt-overview.pdf');
      
      toast({
        title: "Success",
        description: "Debt overview report downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DecimalToggle showDecimals={showDecimals} onToggle={setShowDecimals} />
        <Button 
          onClick={handleDownloadPDF}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Download Overview Report
        </Button>
      </div>
      
      <div className="rounded-lg border bg-white/50 backdrop-blur-sm overflow-hidden">
        <DebtTable
          debts={sortedDebts}
          payoffDetails={payoffDetails}
          onUpdateDebt={onUpdateDebt}
          onDeleteClick={setDebtToDelete}
          showDecimals={showDecimals}
          currencySymbol={currencySymbol}
        />
      </div>

      <DeleteDebtDialog
        debt={debtToDelete}
        onClose={() => setDebtToDelete(null)}
        onConfirm={() => {
          if (debtToDelete) {
            onDeleteDebt(debtToDelete.id);
            setDebtToDelete(null);
          }
        }}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
