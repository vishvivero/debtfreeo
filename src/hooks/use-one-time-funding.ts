
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { OneTimeFunding } from "@/lib/types/payment";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export const useOneTimeFunding = () => {
  const { user } = useAuth();
  const { toast } = useToast();

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

  // Add a one-time funding
  const addOneTimeFunding = async (funding: OneTimeFunding) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add funding",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('one_time_funding')
        .insert([{
          ...funding,
          user_id: user.id,
          is_applied: false
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "One-time funding added successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error adding one-time funding:', error);
      toast({
        title: "Error",
        description: "Failed to add one-time funding",
        variant: "destructive",
      });
    }
  };

  // Remove a one-time funding
  const removeOneTimeFunding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('one_time_funding')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "One-time funding removed successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error removing one-time funding:', error);
      toast({
        title: "Error",
        description: "Failed to remove one-time funding",
        variant: "destructive",
      });
    }
  };

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
    isLoading,
    addOneTimeFunding,
    removeOneTimeFunding
  };
};
