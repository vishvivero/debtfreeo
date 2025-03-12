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
import { Loader2, CalendarIcon, History, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Target, DollarSign, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DebtCalculationProvider } from "@/contexts/DebtCalculationContext";

export default function ResultsHistory() {
  const {
    debts,
    isLoading: isDebtsLoading
  } = useDebts();
  const {
    profile,
    isLoading: isProfileLoading
  } = useProfile();
  const {
    currentPayment,
    extraPayment
  } = useMonthlyPayment();
  const {
    oneTimeFundings
  } = useOneTimeFunding();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0);
  const isLoading = isDebtsLoading || isProfileLoading;

  const pages = [{
    id: "overview",
    label: "Overview"
  }, {
    id: "action-plan",
    label: "Action Plan"
  }, {
    id: "timeline",
    label: "Payoff Timeline"
  }];

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
    return <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>;
  }

  if (!debts) {
    console.error("Debts data is undefined");
    return <MainLayout>
        <div className="container py-8">
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">No debt data available</h2>
            <p className="text-muted-foreground mb-4">Unable to load your debt information. Please try again later.</p>
            <Button onClick={() => navigate("/overview")}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>;
  }

  const totalDebt = debts ? debts.reduce((sum, debt) => sum + debt.balance, 0) : 0;
  const avgInterestRate = debts && totalDebt > 0 ? debts.reduce((sum, debt) => sum + debt.interest_rate * debt.balance, 0) / totalDebt : 0;
  const selectedStrategyId = profile?.selected_strategy || strategies[0].id;
  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];
  const results = [{
    id: "latest",
    date: new Date(),
    label: "Current Plan"
  }];
  const currencySymbol = profile?.preferred_currency || "£";

  const safeCurrentPayment = currentPayment > 0 ? currentPayment : 1;
  const estimatedMonths = Math.ceil(totalDebt / safeCurrentPayment);
  const estimatedYears = Math.floor(estimatedMonths / 12);
  const remainingMonths = estimatedMonths % 12;

  return <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="container py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => navigate("/strategy")} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Debt Strategy Results</h1>
              <p className="text-muted-foreground">Review your personalized debt repayment plan and track progress</p>
            </div>
          </div>
          
          <Tabs defaultValue="latest" className="space-y-4" onValueChange={setSelectedTab}>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => navigate("/strategy")} className="gap-2">
                Update Plan
              </Button>
            </div>
            
            <TabsContent value="latest" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  {pages.map((page, index) => <Button key={page.id} variant={currentPage === index ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(index)} className={`${currentPage === index ? 'bg-primary text-white' : ''}`}>
                      {page.label}
                    </Button>)}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPage === 0} className="gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === pages.length - 1} className="gap-1">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {currentPage === 0 && <motion.div key="overview" initial={{
                opacity: 0,
                x: -50
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: 50
              }} transition={{
                duration: 0.3
              }}>
                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <History className="h-4 w-4 text-slate-500" />
                            Strategy Overview
                          </CardTitle>
                          <div className="text-sm text-slate-500">
                            Updated {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="p-6 bg-white dark:bg-slate-900">
                          <div className="grid gap-6 md:grid-cols-3 mb-6">
                            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                              <div className="flex items-start">
                                <div className="mr-3">
                                  <Target className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Strategy</div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedStrategy.name}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                              <div className="flex items-start">
                                <div className="mr-3">
                                  <DollarSign className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Payment</div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    {currencySymbol}{currentPayment.toLocaleString()}
                                  </div>
                                  {extraPayment > 0 && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      Including {currencySymbol}{extraPayment.toLocaleString()} extra
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                              <div className="flex items-start">
                                <div className="mr-3">
                                  <Clock className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Estimated Timeline</div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    {estimatedYears > 0 ? `${estimatedYears} ${estimatedYears === 1 ? 'year' : 'years'}` : ''} 
                                    {remainingMonths > 0 ? `${estimatedYears > 0 ? ' and ' : ''}${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}` : ''}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                          <h3 className="text-lg font-semibold mb-5 text-slate-800 dark:text-slate-200">Results Summary</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                              <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="h-5 w-5 text-slate-500" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Debt</span>
                              </div>
                              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                {currencySymbol}{totalDebt.toLocaleString()}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {debts.length} active {debts.length === 1 ? 'debt' : 'debts'}
                              </div>
                            </div>
                            
                            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-5 w-5 text-slate-500" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Strategy Impact</span>
                              </div>
                              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                {selectedStrategy.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Using {selectedStrategy.description.split(' ').slice(0, 5).join(' ')}...
                              </div>
                            </div>
                            
                            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-5 w-5 text-slate-500" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Interest Rate</span>
                              </div>
                              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                {avgInterestRate.toFixed(1)}%
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Weighted average
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm">
                            This overview shows your current debt strategy and key metrics. Navigate through the tabs to see your detailed action plan and projected timeline.
                          </p>
                          
                          {oneTimeFundings.length > 0 && (
                            <div className="mt-6 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                              <div className="flex items-start">
                                <div className="mr-3">
                                  <DollarSign className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                                    {oneTimeFundings.length > 1 ? 'Lump Sum Payments' : 'Lump Sum Payment'}
                                  </h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    You've added {oneTimeFundings.length} {oneTimeFundings.length > 1 ? 'payments' : 'payment'} totaling {currencySymbol}
                                    {oneTimeFundings.reduce((sum, f) => sum + Number(f.amount), 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="text-center">
                      <Button onClick={handleNext} className="gap-2">
                        View Action Plan
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>}
                
                {currentPage === 1 && <motion.div key="action-plan" initial={{
                opacity: 0,
                x: -50
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: 50
              }} transition={{
                duration: 0.3
              }}>
                    <DebtCalculationProvider>
                      <PersonalizedActionPlan />
                    </DebtCalculationProvider>
                    
                    <div className="text-center mt-6">
                      <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={handlePrevious} className="gap-2">
                          <ChevronLeft className="h-4 w-4" />
                          Back to Overview
                        </Button>
                        <Button onClick={handleNext} className="gap-2">
                          View Timeline
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>}
                
                {currentPage === 2 && <motion.div key="timeline" initial={{
                opacity: 0,
                x: -50
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: 50
              }} transition={{
                duration: 0.3
              }}>
                    {debts && debts.length > 0 && <div className="w-full">
                        <PayoffTimeline debts={debts} extraPayment={extraPayment} enableOneTimeFundings={oneTimeFundings.length > 0} />
                      </div>}
                    
                    <div className="text-center mt-6">
                      <Button variant="outline" onClick={handlePrevious} className="gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Action Plan
                      </Button>
                    </div>
                  </motion.div>}
              </AnimatePresence>
              
              <div className="flex justify-center items-center mt-8 gap-2">
                {pages.map((_, index) => <div key={index} className={`h-2 rounded-full transition-all ${currentPage === index ? 'w-8 bg-indigo-600 dark:bg-indigo-500' : 'w-2 bg-gray-300 dark:bg-gray-700 cursor-pointer'}`} onClick={() => setCurrentPage(index)} />)}
              </div>
            </TabsContent>
            
            {results.filter(r => r.id !== "latest").map(result => <TabsContent key={result.id} value={result.id} className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Results from {result.date.toLocaleDateString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Historical data would be displayed here in future versions</p>
                  </CardContent>
                </Card>
              </TabsContent>)}
          </Tabs>
        </div>
      </div>
    </MainLayout>;
}
