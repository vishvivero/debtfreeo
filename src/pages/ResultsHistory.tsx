
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
import { Loader2, CalendarIcon, History, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ResultsHistory() {
  const { debts, isLoading: isDebtsLoading } = useDebts();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { currentPayment, extraPayment } = useMonthlyPayment();
  const { oneTimeFundings } = useOneTimeFunding();
  const navigate = useNavigate();
  
  const [selectedTab, setSelectedTab] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0);
  
  const isLoading = isDebtsLoading || isProfileLoading;
  
  // Define page content sections
  const pages = [
    { id: "overview", label: "Overview" },
    { id: "action-plan", label: "Action Plan" },
    { id: "timeline", label: "Payoff Timeline" }
  ];
  
  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
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

  const currencySymbol = profile?.preferred_currency || "£";
  
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
            
            <TabsContent value="latest" className="mt-0">
              {/* Pagination Navigation - Top */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  {pages.map((page, index) => (
                    <Button 
                      key={page.id}
                      variant={currentPage === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(index)}
                      className={`${currentPage === index ? 'bg-primary text-white' : ''}`}
                    >
                      {page.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={handleNext}
                    disabled={currentPage === pages.length - 1}
                    className="gap-1"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Page Content with Animation */}
              <AnimatePresence mode="wait">
                {currentPage === 0 && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-md mb-6">
                      <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <span className="p-1.5 rounded-full bg-purple-500 text-white">
                              <History className="h-4 w-4" />
                            </span>
                            Strategy Overview
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
                              {currencySymbol}{currentPayment.toLocaleString()}
                            </div>
                          </div>
                          <div className="rounded-lg border p-4">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Extra Monthly</div>
                            <div className="font-semibold">
                              {currencySymbol}{extraPayment.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-6" />
                        
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold">Results Summary</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                              <div className="text-sm font-medium text-emerald-700 mb-1">Total Debt</div>
                              <div className="text-2xl font-bold text-emerald-900">
                                {currencySymbol}{debts.reduce((sum, debt) => sum + debt.balance, 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-emerald-600 mt-1">
                                {debts.length} active {debts.length === 1 ? 'debt' : 'debts'}
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                              <div className="text-sm font-medium text-blue-700 mb-1">Time Until Debt-Free</div>
                              <div className="text-2xl font-bold text-blue-900">
                                ~{Math.ceil(debts.reduce((sum, debt) => sum + debt.balance, 0) / currentPayment)} months
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                Using {selectedStrategy.name} strategy
                              </div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                              <div className="text-sm font-medium text-purple-700 mb-1">Average Interest Rate</div>
                              <div className="text-2xl font-bold text-purple-900">
                                {avgInterestRate ? avgInterestRate.toFixed(1) : 0}%
                              </div>
                              <div className="text-xs text-purple-600 mt-1">
                                Weighted by debt balance
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground">
                            This overview shows your current debt strategy and key metrics. Navigate to see your detailed action plan and projected timeline.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="text-center">
                      <Button
                        onClick={handleNext}
                        className="gap-2"
                      >
                        View Action Plan
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {currentPage === 1 && (
                  <motion.div
                    key="action-plan"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PersonalizedActionPlan />
                    
                    <div className="text-center mt-6">
                      <div className="flex justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={handlePrevious}
                          className="gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back to Overview
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="gap-2"
                        >
                          View Timeline
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {currentPage === 2 && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {debts && debts.length > 0 && (
                      <div className="w-full">
                        <PayoffTimeline
                          debts={debts}
                          extraPayment={extraPayment}
                          enableOneTimeFundings={oneTimeFundings.length > 0}
                        />
                      </div>
                    )}
                    
                    <div className="text-center mt-6">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Action Plan
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Pagination Indicator */}
              <div className="flex justify-center items-center mt-8 gap-2">
                {pages.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      currentPage === index 
                        ? 'w-8 bg-primary' 
                        : 'w-2 bg-gray-300 cursor-pointer'
                    }`}
                    onClick={() => setCurrentPage(index)}
                  />
                ))}
              </div>
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
