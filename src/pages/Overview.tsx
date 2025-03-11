
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { useDebts } from "@/hooks/use-debts";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { MainLayout } from "@/components/layout/MainLayout";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { DebtScoreCard } from "@/components/overview/DebtScoreCard";
import { OverviewMetrics } from "@/components/overview/OverviewMetrics";
import { DebtComparison } from "@/components/overview/DebtComparison";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/use-profile";

const Overview = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { debts, isLoading } = useDebts();
  const { profile, updateProfile } = useProfile();

  const handleCurrencyChange = async (newCurrencySymbol: string) => {
    if (!user?.id) return;

    try {
      await updateProfile.mutateAsync({
        preferred_currency: newCurrencySymbol
      });

      toast({
        title: "Success",
        description: "Currency preference updated successfully",
      });
    } catch (error) {
      console.error("Error saving currency preference:", error);
      toast({
        title: "Error",
        description: "Failed to save currency preference",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const currentCurrencySymbol = profile?.preferred_currency || '£';

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800">
        <div className="container py-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg"
          >
            <OverviewHeader 
              currencySymbol={currentCurrencySymbol}
              onCurrencyChange={handleCurrencyChange}
            />
            <OverviewMetrics />
          </motion.div>
          
          {/* DebtComparison shows both optimized and baseline scenarios */}
          <DebtComparison />
          
          {/* DebtScoreCard shows credit score and other metrics */}
          <DebtScoreCard />
        </div>
      </div>
    </MainLayout>
  );
};

export default Overview;
