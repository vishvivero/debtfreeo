
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Debt } from "@/lib/types/debt";

export const useDebtPaymentHistory = (debt: Debt) => {
  const [totalPaid, setTotalPaid] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching payment history for debt:', debt.id);
        
        const { data: payments, error } = await supabase
          .from('payment_history')
          .select('total_payment')
          .eq('user_id', debt.user_id)
          .gte('payment_date', debt.created_at);

        if (error) {
          throw error;
        }

        const totalAmount = payments?.reduce((sum, payment) => sum + payment.total_payment, 0) || 0;
        console.log('Total amount paid:', totalAmount);
        setTotalPaid(totalAmount);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    if (debt.id && debt.user_id && debt.created_at) {
      fetchPaymentHistory();
    } else {
      setIsLoading(false);
    }
  }, [debt.id, debt.user_id, debt.created_at]);

  return { totalPaid, isLoading, error };
};
