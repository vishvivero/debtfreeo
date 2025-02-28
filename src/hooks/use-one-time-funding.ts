
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export interface OneTimeFunding {
  id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  is_applied: boolean;
  currency_symbol: string;
}

export const useOneTimeFunding = () => {
  const { user } = useAuth();

  const {
    data: oneTimeFundings,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["one-time-funding", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching one-time funding entries for user:', user.id);
      const { data, error } = await supabase
        .from('one_time_funding')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_applied', false)
        .gte('payment_date', new Date().toISOString())
        .order('payment_date', { ascending: true });

      if (error) {
        console.error('Error fetching one-time funding:', error);
        throw error;
      }

      console.log('Fetched one-time funding entries:', data);
      return data as OneTimeFunding[];
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('one_time_funding_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'one_time_funding',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('One-time funding changed:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  return {
    oneTimeFundings: oneTimeFundings || [],
    isLoading
  };
};
