
import { MainLayout } from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { useDebts } from "@/hooks/use-debts";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonalizedActionPlan } from "@/components/strategy/sections/PersonalizedActionPlan";
import { PayoffTimeline } from "@/components/debt/PayoffTimeline";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { strategies } from "@/lib/strategies";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, CalendarIcon, History, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ResultsHistory() {
  const { debts, isLoading: isDebtsLoading } = useDebts();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { currentPayment, extraPayment } = useMonthlyPayment();
  const { oneTimeFundings } = useOneTimeFunding();
  const navigate = useNavigate();
  
  const [selectedTab, setSelectedTab] = useState("latest");
  
  const isLoading = isDebtsLoading || isProfileLoading;
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }
  
  // Determine the selected strategy
  const selectedStrategyId = profile?.selected_strategy || strategies[0].id;
  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];
  
  // For future enhancement: This would fetch actual historical results from a database
  // For now, we're just showing the current result
  const results = [
    {
      id: "latest",
      date: new Date(),
      label: "Current Plan",
    },
    // Historical results would be added here
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3]">
        <div className="container py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/strategy")}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Debt Strategy Results</h1>
              <p className="text-muted-foreground">Review your personalized debt repayment plan and track progress</p>
            </div>
          </div>
          
          <Tabs defaultValue="latest" className="space-y-4" onValueChange={setSelectedTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                {results.map(result => (
                  <TabsTrigger key={result.id} value={result.id} className="gap-2">
                    {result.id === "latest" ? (
                      <>
                        <History className="h-4 w-4" />
                        {result.label}
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="h-4 w-4" />
                        {result.date.toLocaleDateString()}
                      </>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/strategy")}
                className="gap-2"
              >
                Update Plan
              </Button>
            </div>
            
            <TabsContent value="latest" className="mt-0 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="p-1.5 rounded-full bg-purple-500 text-white">
                        <History className="h-4 w-4" />
                      </span>
                      Latest Strategy Results
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Updated {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Strategy</div>
                      <div className="font-semibold">{selectedStrategy.name}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Monthly Payment</div>
                      <div className="font-semibold">
                        {profile?.preferred_currency || "£"}{currentPayment.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Extra Monthly</div>
                      <div className="font-semibold">
                        {profile?.preferred_currency || "£"}{extraPayment.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Results Overview</h3>
                    <p className="text-muted-foreground">
                      Here's a detailed breakdown of your debt repayment plan based on your current 
                      strategy and payment settings.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PersonalizedActionPlan />
              </motion.div>

              {debts && debts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full"
                >
                  <PayoffTimeline
                    debts={debts}
                    extraPayment={extraPayment}
                    enableOneTimeFundings={oneTimeFundings.length > 0}
                  />
                </motion.div>
              )}
            </TabsContent>
            
            {/* For future versions with historical data */}
            {results.filter(r => r.id !== "latest").map(result => (
              <TabsContent key={result.id} value={result.id} className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Results from {result.date.toLocaleDateString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Historical data would be displayed here in future versions</p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
