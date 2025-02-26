import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { useDebts } from "@/hooks/use-debts";
import { MainLayout } from "@/components/layout/MainLayout";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { DebtScoreCard } from "@/components/overview/DebtScoreCard";
import { DebtOverview } from "@/components/overview/DebtOverview";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/use-profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { countryCurrencies } from "@/lib/utils/currency-data";
import { ActionPlan } from "@/components/overview/ActionPlan";
import { useIsMobile } from "@/hooks/use-mobile";

const Overview = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { debts, isLoading, error } = useDebts();
  const { profile, updateProfile } = useProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const isMobile = useIsMobile();

  const validateCurrency = (currencySymbol: string) => {
    return countryCurrencies.some(currency => currency.symbol === currencySymbol);
  };

  const handleCurrencyChange = async (newCurrencySymbol: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to change currency preferences",
        variant: "destructive",
      });
      return;
    }

    if (!validateCurrency(newCurrencySymbol)) {
      toast({
        title: "Error",
        description: "Selected currency is not supported",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

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
        description: "Failed to save currency preference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-2 sm:space-y-6">
      <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="h-32 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  );

  if (error) {
    return (
      <MainLayout>
        <div className="container py-2 sm:py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load your debt overview. Please try refreshing the page.'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const currentCurrencySymbol = profile?.preferred_currency || '£';

  const metrics = useMemo(() => {
    if (!debts?.length) return {
      highestAprDebt: undefined,
      lowestBalanceDebt: undefined,
      monthlyInterest: 0,
    };

    const highestAprDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    const lowestBalanceDebt = [...debts].sort((a, b) => a.balance - b.balance)[0];
    const monthlyInterest = debts.reduce((total, debt) => {
      return total + (debt.balance * (debt.interest_rate / 100) / 12);
    }, 0);

    return {
      highestAprDebt,
      lowestBalanceDebt,
      monthlyInterest,
    };
  }, [debts]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800">
        <div className="container py-2 sm:py-8 px-3 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-2 sm:space-y-6"
              >
                <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-xl shadow-lg">
                  <div className="p-3 sm:p-6">
                    <OverviewHeader
                      currencySymbol={currentCurrencySymbol}
                      onCurrencyChange={handleCurrencyChange}
                    />
                    <DebtOverview />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-full"
                >
                  <DebtScoreCard />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <ActionPlan
                    highestAprDebt={metrics.highestAprDebt ? {
                      name: metrics.highestAprDebt.name,
                      apr: metrics.highestAprDebt.interest_rate
                    } : undefined}
                    lowestBalanceDebt={metrics.lowestBalanceDebt ? {
                      name: metrics.lowestBalanceDebt.name,
                      balance: metrics.lowestBalanceDebt.balance
                    } : undefined}
                    monthlyInterest={metrics.monthlyInterest}
                    optimizationScore={0}
                    currencySymbol={currentCurrencySymbol}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
};

export default Overview;
