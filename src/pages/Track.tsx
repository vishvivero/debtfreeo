
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDebts } from "@/hooks/use-debts";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import { Loader2, Calendar, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingPayments } from "@/components/payment/UpcomingPayments";
import { PaymentHistory } from "@/components/payment/PaymentHistory";

export default function Track() {
  const { debts, isLoading } = useDebts();
  const [activeTab, setActiveTab] = useState("upcoming");

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!debts || debts.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-3xl font-bold">Track Payments</h1>
          </div>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Track Your Debts</CardTitle>
            </CardHeader>
            <CardContent>
              <NoDebtsMessage />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold">Track Payments</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Monitor, record, and manage your debt payments
        </p>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Payments
            </TabsTrigger>
            <TabsTrigger value="history">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-6">
            <UpcomingPayments debts={debts} />
          </TabsContent>
          
          <TabsContent value="history">
            <PaymentHistory />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
