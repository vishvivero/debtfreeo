
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AddDebtDialog } from "@/components/debt/AddDebtDialog";
import { useDebts } from "@/hooks/use-debts";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Debt } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

export const NoDebtsMessage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addDebt, profile, refreshDebts } = useDebts();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleAddDebt = async (debt: Omit<Debt, "id">) => {
    try {
      await addDebt.mutateAsync(debt);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Debt added successfully",
      });
    } catch (error) {
      console.error("Error adding debt:", error);
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshData = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["debts", user.id] });
      await refreshDebts();
      toast({
        title: "Data Refreshed",
        description: "Your debt data has been refreshed",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleIconClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-4 sm:space-y-6 py-4 sm:py-8"
    >
      <div onClick={handleIconClick} className="cursor-pointer">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-3 sm:p-4 bg-emerald-50 rounded-full mb-2"
        >
          <Plus className={`${isMobile ? "w-8 h-8" : "w-12 h-12"} text-emerald-600`} />
        </motion.div>
        <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-900`}>No Debts Added Yet!</h2>
      </div>
      
      <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
        Start tracking your debts to begin your journey to financial freedom. Add your first debt to see how Debtfreeo can help you become debt-free faster.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
        >
          Add Your First Debt
        </Button>
        
        <Button 
          onClick={handleRefreshData}
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      <AddDebtDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddDebt={handleAddDebt}
        currencySymbol={profile?.preferred_currency || "£"}
      />
    </motion.div>
  );
};
