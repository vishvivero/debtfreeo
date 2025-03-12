
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { useDebts } from "@/hooks/use-debts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtCard } from "@/components/debt/DebtCard";
import { AddDebtDialog } from "@/components/debt/AddDebtDialog";
import { motion } from "framer-motion";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import type { Debt } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert"; 

const DebtList = () => {
  const { user } = useAuth();
  const { debts, isLoading, deleteDebt, addDebt, profile, error, refreshDebts } = useDebts();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refresh debts data when component mounts
    if (user?.id) {
      refreshDebts();
    }
  }, [user?.id, refreshDebts]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["debts", user.id] });
      await refreshDebts();
    } catch (err) {
      console.error("Error refreshing debts:", err);
    } finally {
      setIsRefreshing(false);
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

  if (error) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertDescription>
              There was an error loading your debts. Please try refreshing the page.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!debts || debts.length === 0) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
          <div className="container py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Debt Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage all your debts in one place</p>
              </div>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="self-start"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
            <div className="glassmorphism rounded-xl p-4 sm:p-6 shadow-lg bg-white/95 backdrop-blur-sm border border-gray-100">
              <NoDebtsMessage />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const activeDebts = debts?.filter(debt => debt.balance > 0) || [];
  const completedDebts = debts?.filter(debt => debt.balance === 0) || [];

  const filteredActiveDebts = activeDebts.filter(debt => 
    debt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedDebts = completedDebts.filter(debt => 
    debt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculatePayoffYears = (currentDebt: Debt) => {
    const monthlyInterest = currentDebt.interest_rate / 1200;
    const monthlyPayment = currentDebt.minimum_payment;
    const balance = currentDebt.balance;
    
    if (monthlyPayment <= balance * monthlyInterest) {
      return "Never";
    }

    const months = Math.log(monthlyPayment / (monthlyPayment - balance * monthlyInterest)) / Math.log(1 + monthlyInterest);
    return `${Math.ceil(months / 12)} years`;
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div className="container py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Debt Management</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage all your debts in one place</p>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="self-start"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <div className="glassmorphism rounded-xl p-4 sm:p-6 shadow-lg bg-white/95 backdrop-blur-sm border border-gray-100">
              <div className={`${isMobile ? "flex flex-col gap-3" : "flex items-center justify-between gap-4"} mb-6`}>
                <Input
                  type="search"
                  placeholder="Search debts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={isMobile ? "w-full" : "max-w-sm"}
                />
                
                {isMobile ? (
                  <Button 
                    onClick={() => document.getElementById("add-debt-trigger")?.click()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Debt
                  </Button>
                ) : (
                  <AddDebtDialog 
                    onAddDebt={addDebt.mutateAsync} 
                    currencySymbol={profile?.preferred_currency || '£'} 
                  />
                )}
                
                {/* Hidden trigger for mobile */}
                <span id="add-debt-trigger" className="hidden">
                  <AddDebtDialog 
                    onAddDebt={addDebt.mutateAsync} 
                    currencySymbol={profile?.preferred_currency || '£'} 
                  />
                </span>
              </div>

              <Tabs defaultValue="active" className="w-full">
                <TabsList className={`mb-4 ${isMobile ? "w-full" : ""}`}>
                  <TabsTrigger value="active" className={isMobile ? "flex-1" : ""}>
                    Active Debts ({debts.filter(debt => debt.balance > 0).length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className={isMobile ? "flex-1" : ""}>
                    Completed ({debts.filter(debt => debt.balance === 0).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3">
                  {debts.filter(debt => 
                    debt.balance > 0 && debt.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      onDelete={deleteDebt.mutate}
                      calculatePayoffYears={(currentDebt) => {
                        const monthlyInterest = currentDebt.interest_rate / 1200;
                        const monthlyPayment = currentDebt.minimum_payment;
                        const balance = currentDebt.balance;
                        
                        if (monthlyPayment <= balance * monthlyInterest) {
                          return "Never";
                        }

                        const months = Math.log(monthlyPayment / (monthlyPayment - balance * monthlyInterest)) / Math.log(1 + monthlyInterest);
                        return `${Math.ceil(months / 12)} years`;
                      }}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="completed" className="space-y-3">
                  {debts.filter(debt => 
                    debt.balance === 0 && debt.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      onDelete={deleteDebt.mutate}
                      calculatePayoffYears={() => "Completed"}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DebtList;
