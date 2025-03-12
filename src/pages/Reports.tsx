
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Calculator, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebts } from "@/hooks/use-debts";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { OverviewTab } from "@/components/reports/OverviewTab";
import { AmortizationTab } from "@/components/reports/AmortizationTab";
import { PaymentTrendsTab } from "@/components/reports/PaymentTrendsTab";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Reports() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const { debts, isLoading } = useDebts();
  const isMobile = useIsMobile();

  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      console.log("Fetching payment history for reports");
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .order("payment_date", { ascending: true });

      if (error) {
        console.error("Error fetching payment history:", error);
        throw error;
      }

      return data;
    },
  });

  if (isLoading || isPaymentsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!debts || debts.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto pt-2 sm:pt-4 w-full max-w-[1200px] px-3 sm:px-4">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Financial Reports</h1>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 sm:p-6">
            <NoDebtsMessage />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto pt-2 sm:pt-4 w-full max-w-[1200px] px-3 sm:px-4">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Financial Reports</h1>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4 overflow-x-auto flex w-full justify-start sm:justify-start p-1 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
              <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="amortization" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Amortization</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Payment Trends</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="w-full">
            <OverviewTab debts={debts || []} />
          </TabsContent>

          <TabsContent value="amortization" className="w-full">
            <AmortizationTab debts={debts || []} />
          </TabsContent>

          <TabsContent value="trends" className="w-full">
            <PaymentTrendsTab payments={payments} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
