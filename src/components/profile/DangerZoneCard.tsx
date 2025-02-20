
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DangerZoneCardProps {
  showNotifications: boolean;
}

export const DangerZoneCard = ({ showNotifications }: DangerZoneCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleResetData = async () => {
    if (!user?.id) return;

    try {
      setIsUpdating(true);
      
      // Start all operations in parallel for better performance
      const operations = [
        // Delete debts
        supabase.from('debts').delete().eq('user_id', user.id),
        // Delete payment history
        supabase.from('payment_history').delete().eq('user_id', user.id),
        // Delete one-time funding
        supabase.from('one_time_funding').delete().eq('user_id', user.id),
        // Reset monthly payment in profile
        supabase.from('profiles').update({ 
          monthly_payment: 0,
          show_extra_payments: false,
          show_lump_sum_payments: false 
        }).eq('id', user.id)
      ];

      // Wait for all operations to complete
      const results = await Promise.all(operations);

      // Check if any operation failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error("Errors during data reset:", errors);
        throw new Error("Failed to reset some data");
      }
      
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries();
      
      if (showNotifications) {
        toast({
          title: "Data Reset Complete",
          description: "All your data has been successfully reset"
        });
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      if (showNotifications) {
        toast({
          title: "Error",
          description: "Failed to reset data",
          variant: "destructive"
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Reset Account Data</h3>
          <p className="text-sm text-muted-foreground mb-2">
            All your debts, payments, and preferences will be deleted, but your account will remain active.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="text-destructive border-destructive hover:bg-destructive/10"
                disabled={isUpdating}
              >
                {isUpdating ? "Resetting..." : "Reset Data"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your debts,
                  payment history, and reset your preferences to default settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleResetData}
                >
                  Reset Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
