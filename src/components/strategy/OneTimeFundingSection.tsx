import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfile } from "@/hooks/use-profile";

interface FundingEntry {
  id: string;
  amount: number;
  payment_date: string;
  notes?: string;
  is_applied: boolean;
  currency_symbol: string;
}

export function OneTimeFundingSection() {
  const [fundingEntries, setFundingEntries] = useState<FundingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useProfile();

  const fetchFundingEntries = async () => {
    // Don't fetch if lump sum payments are disabled
    if (!profile?.show_lump_sum_payments) {
      setFundingEntries([]);
      setIsLoading(false);
      return;
    }

    console.log('Fetching one-time funding entries');
    try {
      const { data, error } = await supabase
        .from('one_time_funding')
        .select('*')
        .order('payment_date', { ascending: true });

      if (error) {
        console.error('Error fetching funding entries:', error);
        toast({
          title: "Error",
          description: "Failed to load funding entries",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched funding entries:', data);
      setFundingEntries(data || []);
    } catch (error) {
      console.error('Error in fetchFundingEntries:', error);
      toast({
        title: "Error",
        description: "Failed to load funding entries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFundingEntries();

    // Subscribe to changes in one_time_funding table
    const channel = supabase
      .channel('one_time_funding_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'one_time_funding'
        },
        (payload) => {
          console.log('One-time funding changed:', payload);
          fetchFundingEntries();
        }
      )
      .subscribe();

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: profile?.id ? `id=eq.${profile.id}` : undefined
        },
        (payload) => {
          console.log('Profile updated:', payload);
          fetchFundingEntries();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      profileChannel.unsubscribe();
    };
  }, [profile?.id, profile?.show_lump_sum_payments]);

  const handleDelete = async (id: string) => {
    console.log('Deleting funding entry:', id);
    try {
      const { error } = await supabase
        .from('one_time_funding')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Funding entry deleted successfully",
      });

      await fetchFundingEntries();
    } catch (error) {
      console.error('Error deleting funding entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete funding entry",
        variant: "destructive",
      });
    }
  };

  // If lump sum payments are disabled, don't show the section
  if (!profile?.show_lump_sum_payments) {
    return null;
  }

  const totalFunding = fundingEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">One-Time Funding</h3>
      {fundingEntries.length > 0 ? (
        <>
          <div className="space-y-2">
            {fundingEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border"
              >
                <div>
                  <div className="font-medium">
                    {entry.currency_symbol}{entry.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(entry.payment_date), 'MMM d, yyyy')}
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-500">{entry.notes}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                  disabled={entry.is_applied}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Alert>
            <AlertDescription>
              Total one-time funding: {fundingEntries[0]?.currency_symbol}
              {totalFunding.toFixed(2)}
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <div className="text-gray-500">No one-time funding entries</div>
      )}
    </div>
  );
}