
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebts } from "@/hooks/use-debts";
import { CreditCard, Calendar, Info, DollarSign, Percent } from "lucide-react";
import { DebtCategorySelect } from "@/components/debt/DebtCategorySelect";
import { useToast } from "@/components/ui/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { addMonths, format } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";
import { countryCurrencies } from "@/lib/utils/currency-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { getExchangeRateUpdateDate, exchangeRates2025 } from "@/lib/utils/currencyConverter";

export interface AddDebtFormProps {
  onAddDebt?: (debt: any) => void;
  currencySymbol?: string;
  onClose?: () => void;
  showCancelButton?: boolean;
}

export const AddDebtForm = ({ 
  onAddDebt, 
  currencySymbol = "£", 
  onClose, 
  showCancelButton = true 
}: AddDebtFormProps) => {
  const { addDebt } = useDebts();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Credit Card");
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("basics");
  const [selectedCurrency, setSelectedCurrency] = useState(currencySymbol);
  
  const [isInterestIncluded, setIsInterestIncluded] = useState(false);
  const [remainingMonths, setRemainingMonths] = useState("");
  const [useRemainingMonths, setUseRemainingMonths] = useState(false);
  const [calculatedPrincipal, setCalculatedPrincipal] = useState<number | null>(null);
  const [usePrincipalAsBalance, setUsePrincipalAsBalance] = useState(false);
  
  useEffect(() => {
    if (isInterestIncluded && remainingMonths && balance && minimumPayment && interestRate) {
      const principal = InterestCalculator.calculatePrincipalFromTotal(
        Number(balance),
        Number(interestRate),
        Number(minimumPayment),
        Number(remainingMonths)
      );
      setCalculatedPrincipal(principal);
      
      if (usePrincipalAsBalance) {
        setBalance(principal.toFixed(2));
      }
    } else {
      setCalculatedPrincipal(null);
    }
  }, [isInterestIncluded, remainingMonths, balance, minimumPayment, interestRate, usePrincipalAsBalance]);

  const estimatedInterestRate = useRemainingMonths && balance && minimumPayment && remainingMonths ? 
    calculateEstimatedInterestRate(
      Number(balance), 
      Number(minimumPayment), 
      Number(remainingMonths)
    ) : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      let finalInterestRate = Number(interestRate);
      
      if (useRemainingMonths && estimatedInterestRate !== null) {
        finalInterestRate = estimatedInterestRate;
      }
      
      const finalBalance = usePrincipalAsBalance && calculatedPrincipal !== null
        ? calculatedPrincipal
        : Number(balance);
      
      const newDebt = {
        name,
        balance: finalBalance,
        interest_rate: finalInterestRate,
        minimum_payment: Number(minimumPayment),
        banker_name: "Not specified",
        currency_symbol: selectedCurrency,
        next_payment_date: date.toISOString(),
        category,
        status: 'active' as const,
        metadata: {
          interest_included: isInterestIncluded,
          remaining_months: (isInterestIncluded || useRemainingMonths) ? Number(remainingMonths) : null,
          original_rate: isInterestIncluded ? finalInterestRate : null,
          total_with_interest: isInterestIncluded && !usePrincipalAsBalance ? Number(balance) : null
        }
      };

      if (onAddDebt) {
        await onAddDebt(newDebt);
      } else {
        await addDebt.mutateAsync(newDebt);
      }

      toast({
        title: "Success",
        description: "Debt added successfully",
      });

      setName("");
      setCategory("Credit Card");
      setBalance("");
      setInterestRate("");
      setMinimumPayment("");
      setDate(new Date());
      setIsInterestIncluded(false);
      setRemainingMonths("");
      setUseRemainingMonths(false);
      setUsePrincipalAsBalance(false);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error adding debt:", error);
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
    }
  };

  function calculateEstimatedInterestRate(
    principal: number, 
    monthlyPayment: number, 
    months: number
  ): number | null {
    if (principal <= 0 || monthlyPayment <= 0 || months <= 0) {
      return null;
    }

    let rate = 5.0;
    const maxIterations = 100;
    const tolerance = 0.01;
    
    for (let i = 0; i < maxIterations; i++) {
      const monthlyRate = rate / 1200;
      const calculatedPayment = 
        principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
        (Math.pow(1 + monthlyRate, months) - 1);
      
      const diff = calculatedPayment - monthlyPayment;
      
      if (Math.abs(diff) < tolerance) {
        break;
      }
      
      if (diff > 0) {
        rate -= 0.1;
      } else {
        rate += 0.1;
      }
      
      if (rate < 0) rate = 0;
      if (rate > 100) rate = 100;
    }
    
    return parseFloat(rate.toFixed(2));
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get base currency conversion rate
  const getConversionRate = (fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return 1;
    
    const fromRate = exchangeRates2025[fromCurrency] || 1;
    const toRate = exchangeRates2025[toCurrency] || 1;
    
    return (1 / fromRate) * toRate;
  };

  // Get selected currency details
  const selectedCurrencyDetails = countryCurrencies.find(c => c.symbol === selectedCurrency);
  const baseCurrencyDetails = countryCurrencies.find(c => c.symbol === currencySymbol);
  const conversionRate = getConversionRate(selectedCurrency, currencySymbol);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className={`border-b ${isMobile ? "overflow-x-auto" : ""}`}>
            <div className={`${isMobile ? "px-2" : "px-4"}`}>
              <TabsList className={`h-12 bg-transparent ${isMobile ? "space-x-2 w-full justify-start" : "space-x-5"} p-0`}>
                <TabsTrigger 
                  value="basics" 
                  className="text-sm font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none h-12 px-1 bg-transparent"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="text-sm font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none h-12 px-1 bg-transparent whitespace-nowrap"
                >
                  Advanced Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="currency" 
                  className="text-sm font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none h-12 px-1 bg-transparent"
                >
                  Currency
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className={`${isMobile ? "p-3" : "p-4"}`}>
            <TabsContent value="basics" className="mt-0 space-y-3">
              <div className={`${isMobile ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-4"}`}>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Debt Name *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 border-gray-300 h-9"
                        placeholder="Personal Loan, Credit Card etc."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Current Outstanding Balance *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">{selectedCurrency}</span>
                      </div>
                      <Input
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        className="pl-9 border-gray-300 h-9"
                        placeholder="Enter balance amount"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Debt Category</Label>
                    <DebtCategorySelect value={category} onChange={setCategory} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Interest Rate (%) *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="pl-9 border-gray-300 h-9"
                        placeholder="5.99"
                        required={!useRemainingMonths}
                        disabled={useRemainingMonths}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Minimum Payment/EMI *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">{selectedCurrency}</span>
                      </div>
                      <Input
                        type="number"
                        value={minimumPayment}
                        onChange={(e) => setMinimumPayment(e.target.value)}
                        className="pl-9 border-gray-300 h-9"
                        placeholder="Monthly payment"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Next Payment Due Date *</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={formatDateForInput(date)}
                        onChange={(e) => {
                          if (e.target.valueAsDate) {
                            setDate(e.target.valueAsDate);
                          }
                        }}
                        className="border-gray-300 h-9 pl-9"
                        min={formatDateForInput(new Date())}
                        required
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 space-y-3">
              <div className="space-y-4">
                <div className={`${isMobile ? "p-2" : "p-3"} border rounded-md bg-gray-50`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Label className="text-sm font-medium">
                        Interest Already Included in Balance
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Enable if total balance includes future interest
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Label className="mr-2 text-xs">
                        {isInterestIncluded ? "On" : "Off"}
                      </Label>
                      <Switch
                        checked={isInterestIncluded}
                        onCheckedChange={(checked) => {
                          setIsInterestIncluded(checked);
                          if (checked) {
                            setUseRemainingMonths(false);
                            if (!remainingMonths) {
                              setRemainingMonths("12");
                            }
                          } else {
                            setUsePrincipalAsBalance(false);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {isInterestIncluded && (
                    <div className="mt-3">
                      <Label className="text-xs font-medium">Months Until Payoff</Label>
                      <Input
                        type="number"
                        value={remainingMonths}
                        onChange={(e) => setRemainingMonths(e.target.value)}
                        placeholder="36"
                        className="mt-1 text-xs h-8"
                        min="1"
                        required={isInterestIncluded}
                      />
                      
                      {balance && minimumPayment && remainingMonths && interestRate && (
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-md text-xs">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {calculatedPrincipal !== null && (
                              <>
                                <div>
                                  <p className="text-xs font-medium text-emerald-800">Principal:</p>
                                  <p className="text-xs text-emerald-600">
                                    {selectedCurrency}{calculatedPrincipal.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-emerald-800">Interest Amount:</p>
                                  <p className="text-xs text-emerald-600">
                                    {selectedCurrency}{(Number(balance) - calculatedPrincipal).toLocaleString(undefined, {maximumFractionDigits: 2})}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <Label className="text-xs font-medium text-emerald-800">
                              Use principal as balance
                            </Label>
                            <Switch
                              checked={usePrincipalAsBalance}
                              onCheckedChange={setUsePrincipalAsBalance}
                              size="sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={`${isMobile ? "p-2" : "p-3"} border rounded-md bg-gray-50`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Label className="text-sm font-medium">
                        Calculate Interest From Payment Term
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Determine interest rate based on payment schedule
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Label className="mr-2 text-xs">
                        {useRemainingMonths ? "On" : "Off"}
                      </Label>
                      <Switch
                        checked={useRemainingMonths}
                        onCheckedChange={(checked) => {
                          setUseRemainingMonths(checked);
                          if (checked) {
                            setIsInterestIncluded(false);
                            setUsePrincipalAsBalance(false);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {useRemainingMonths && (
                    <div className="mt-3">
                      <Label className="text-xs font-medium">Months Until Payoff</Label>
                      <Input
                        type="number"
                        value={remainingMonths}
                        onChange={(e) => setRemainingMonths(e.target.value)}
                        placeholder="36"
                        className="mt-1 text-xs h-8"
                        min="1"
                        required={useRemainingMonths}
                      />
                      
                      {balance && minimumPayment && remainingMonths && (
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-md text-xs">
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <p className="text-xs font-medium text-emerald-800">Payoff Date:</p>
                              <p className="text-xs text-emerald-600">{format(addMonths(new Date(), parseInt(remainingMonths)), 'MMM yyyy')}</p>
                            </div>
                            {estimatedInterestRate !== null && (
                              <div>
                                <p className="text-xs font-medium text-emerald-800">Est. Interest Rate:</p>
                                <p className="text-xs text-emerald-600">{estimatedInterestRate}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="currency" className="mt-0">
              <div className="space-y-4">
                <div className={`${isMobile ? "p-3" : "p-4"} border rounded-md bg-gray-50`}>
                  <div className="flex items-center mb-3">
                    <DollarSign className="h-5 w-5 mr-2 text-emerald-500" />
                    <h3 className="text-base font-semibold">Select Currency</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the currency for this debt. This will help you track debts in multiple currencies,
                    and all amounts will be automatically converted to your preferred currency for unified reporting.
                  </p>
                  
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Currency</Label>
                    <Select 
                      value={selectedCurrency} 
                      onValueChange={setSelectedCurrency}
                    >
                      <SelectTrigger className="w-full border-gray-300">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] bg-white">
                        {countryCurrencies.map((item) => (
                          <SelectItem key={item.symbol} value={item.symbol}>
                            <span className="flex items-center gap-2">
                              <span className="font-medium">{item.symbol}</span>
                              <span className="text-sm text-gray-600">{item.country} - {item.currency}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-md">
                    <p className="text-sm font-medium text-emerald-800">Current Selection:</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xl font-bold text-emerald-600 mr-2">{selectedCurrency}</span>
                      <span className="text-sm text-emerald-700">
                        {selectedCurrencyDetails?.country || 'Unknown'} - 
                        {selectedCurrencyDetails?.currency || 'Unknown'}
                      </span>
                    </div>
                    
                    {selectedCurrency !== currencySymbol && (
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <p className="text-xs font-medium text-emerald-800">Conversion Rate (Annual Average):</p>
                        <p className="text-sm text-emerald-600 mt-1">
                          1 {selectedCurrency} = {conversionRate.toFixed(4)} {currencySymbol}
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">
                          Exchange rates last updated: {getExchangeRateUpdateDate()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="mt-auto flex justify-end items-center p-4 border-t">
        {showCancelButton && (
          <Button 
            type="button" 
            variant="outline"
            className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 mr-auto"
            onClick={() => {
              if (onClose) {
                onClose();
              }
            }}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
        >
          Add Debt
        </Button>
      </div>
    </form>
  );
};

export default AddDebtForm;
