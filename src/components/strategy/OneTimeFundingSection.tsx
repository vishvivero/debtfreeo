import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { OneTimeFundingDialog } from "./OneTimeFundingDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FundingEntry {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  currency_symbol: string;
}

export const OneTimeFundingSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fundingEntries, setFundingEntries] = useState<FundingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFundingEntries = async () => {
    console.log('Fetching one-time funding entries');
    try {
      const { data, error } = await supabase
        .from('one_time_funding')
        .select('*')
        .order('payment_date', { ascending: true })
        .eq('is_applied', false);

      if (error) throw error;
      
      setFundingEntries(data || []);
      console.log('Fetched funding entries:', {
        count: data?.length,
        entries: data?.map(entry => ({
          date: entry.payment_date,
          amount: entry.amount,
          isApplied: entry.is_applied
        }))
      });
    } catch (error) {
      console.error('Error fetching funding entries:', error);
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    console.log('Deleting funding entry:', id);
    try {
      const { error } = await supabase
        .from('one_time_funding')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFundingEntries(entries => entries.filter(entry => entry.id !== id));
      toast({
        title: "Success",
        description: "Funding entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting funding entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete funding entry",
        variant: "destructive",
      });
    }
  };

  const totalFunding = fundingEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            One-time Funding
          </div>
          {totalFunding > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              Total: {fundingEntries[0]?.currency_symbol}{totalFunding.toLocaleString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add extra payments to accelerate your debt payoff
        </p>
        
        {fundingEntries.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              One-time funding will be applied on the specified dates and will accelerate your debt payoff
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : fundingEntries.length > 0 ? (
          <div className="space-y-3">
            {fundingEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div>
                  <p className="font-medium text-primary">
                    {entry.currency_symbol}{entry.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(entry.payment_date), "PPP")}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No upcoming funding entries
          </p>
        )}

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add One-time Funding
        </Button>
      </CardContent>
      <OneTimeFundingDialog 
        isOpen={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false);
          fetchFundingEntries();
        }} 
      />
    </Card>
  );
};