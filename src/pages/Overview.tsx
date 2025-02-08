
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { useDebts } from "@/hooks/use-debts";
import { MainLayout } from "@/components/layout/MainLayout";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { DebtScoreCard } from "@/components/overview/DebtScoreCard";
import { DebtComparison } from "@/components/overview/DebtComparison";
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
      <div className="min-h-screen">
        <div className="container py-8 space-y-6">
          <OverviewHeader 
            currencySymbol={currentCurrencySymbol}
            onCurrencyChange={handleCurrencyChange}
          />
          <DebtScoreCard />
          <DebtComparison />
        </div>
      </div>
    </MainLayout>
  );
};

export default Overview;
