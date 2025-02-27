
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, AlertCircle, Calendar, DollarSign, ArrowRightCircle } from "lucide-react";
import { OneTimeFundingDialog } from "./OneTimeFundingDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

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
    <Card className="bg-white/95 overflow-hidden border-emerald-100">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-emerald-500" />
            <span>One-time Funding</span>
          </div>
          {totalFunding > 0 && (
            <span className="text-sm font-medium px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              Total: {fundingEntries[0]?.currency_symbol}{totalFunding.toLocaleString()}
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-emerald-700/70 mt-1">
          Add lump sum payments to accelerate your debt payoff journey
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {fundingEntries.length > 0 && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
            <AlertCircle className="h-4 w-4 text-emerald-500" />
            <AlertDescription className="text-emerald-700">
              One-time funding will be applied on the specified dates to accelerate your debt payoff
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-emerald-700">Loading...</span>
          </div>
        ) : fundingEntries.length > 0 ? (
          <div className="space-y-3">
            {fundingEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-emerald-50 rounded-lg border border-emerald-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 flex items-center">
                      {entry.currency_symbol}{entry.amount.toLocaleString()}
                      <ArrowRightCircle className="h-3 w-3 mx-2 text-emerald-500" />
                      <span className="flex items-center text-sm font-normal text-emerald-700">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(entry.payment_date), "MMM d, yyyy")}
                      </span>
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-emerald-50/50 rounded-lg border border-dashed border-emerald-200">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-emerald-800 font-medium">No upcoming funding entries</p>
            <p className="text-sm text-emerald-600/80 mt-1">
              Add a one-time payment to accelerate your debt payoff
            </p>
          </div>
        )}

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-5"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add One-time Funding</span>
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
