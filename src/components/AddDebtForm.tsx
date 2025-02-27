
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebts } from "@/hooks/use-debts";
import { CreditCard, Percent, Wallet, Coins, Info, ChevronDown, ChevronUp, Calculator, Calendar } from "lucide-react";
import { DebtCategorySelect } from "@/components/debt/DebtCategorySelect";
import { useToast } from "@/components/ui/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addMonths, format } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

export interface AddDebtFormProps {
  onAddDebt?: (debt: any) => void;
  currencySymbol?: string;
}

export const AddDebtForm = ({ onAddDebt, currencySymbol = "£" }: AddDebtFormProps) => {
  const { addDebt } = useDebts();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Credit Card");
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("basic");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced options
  const [isInterestIncluded, setIsInterestIncluded] = useState(false);
  const [remainingMonths, setRemainingMonths] = useState("");
  const [useRemainingMonths, setUseRemainingMonths] = useState(false);
  const [calculatedPrincipal, setCalculatedPrincipal] = useState<number | null>(null);
  const [usePrincipalAsBalance, setUsePrincipalAsBalance] = useState(false);
  
  // Calculate projected payoff date based on remaining months
  const projectedPayoffDate = useRemainingMonths && remainingMonths ? 
    format(addMonths(new Date(), parseInt(remainingMonths)), 'MMMM yyyy') : 
    'Not calculated';

  // Calculate estimated interest rate if possible
  const estimatedInterestRate = useRemainingMonths && balance && minimumPayment && remainingMonths ? 
    calculateEstimatedInterestRate(
      Number(balance), 
      Number(minimumPayment), 
      Number(remainingMonths)
    ) : null;

  // Calculate the original principal when interest is included
  useEffect(() => {
    if (isInterestIncluded && remainingMonths && balance && minimumPayment && interestRate) {
      const principal = InterestCalculator.calculatePrincipalFromTotal(
        Number(balance),
        Number(interestRate),
        Number(minimumPayment),
        Number(remainingMonths)
      );
      setCalculatedPrincipal(principal);
      
      // If usePrincipalAsBalance is enabled, update the balance field
      if (usePrincipalAsBalance) {
        setBalance(principal.toFixed(2));
      }
    } else {
      setCalculatedPrincipal(null);
    }
  }, [isInterestIncluded, remainingMonths, balance, minimumPayment, interestRate, usePrincipalAsBalance]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Calculate final interest rate based on advanced settings
      let finalInterestRate = Number(interestRate);
      
      // If using remaining months to calculate interest
      if (useRemainingMonths && estimatedInterestRate !== null) {
        finalInterestRate = estimatedInterestRate;
      }
      
      // Determine the final balance to use (either original or principal)
      const finalBalance = usePrincipalAsBalance && calculatedPrincipal !== null
        ? calculatedPrincipal
        : Number(balance);
      
      const newDebt = {
        name,
        balance: finalBalance,
        interest_rate: finalInterestRate,
        minimum_payment: Number(minimumPayment),
        banker_name: "Not specified",
        currency_symbol: currencySymbol,
        next_payment_date: date.toISOString(),
        category,
        status: 'active' as const,
        // Add metadata for these special cases
        metadata: {
          interest_included: isInterestIncluded,
          remaining_months: (isInterestIncluded || useRemainingMonths) ? Number(remainingMonths) : null,
          original_rate: isInterestIncluded ? finalInterestRate : null,
          total_with_interest: isInterestIncluded && !usePrincipalAsBalance ? Number(balance) : null,
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

      // Reset form fields
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
      setActiveTab("basic");
    } catch (error) {
      console.error("Error adding debt:", error);
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate estimated interest rate based on loan amount, payment and months
  function calculateEstimatedInterestRate(
    principal: number, 
    monthlyPayment: number, 
    months: number
  ): number | null {
    if (principal <= 0 || monthlyPayment <= 0 || months <= 0) {
      return null;
    }

    // Simple estimation using trial and error approach
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
      
      // Adjust rate based on the difference
      if (diff > 0) {
        rate -= 0.1;
      } else {
        rate += 0.1;
      }
      
      // Ensure rate stays reasonable
      if (rate < 0) rate = 0;
      if (rate > 100) rate = 100;
    }
    
    return parseFloat(rate.toFixed(2));
  }

  // Format date to MM/DD/YYYY for display
  const formatDateForDisplay = (date: Date) => {
    return format(date, 'MM/dd/yyyy');
  };

  // Format date to YYYY-MM-DD for input value
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="basic" className="text-base">Basic Info</TabsTrigger>
          <TabsTrigger value="advanced" className="text-base">Advanced Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-5">
          {/* Debt Category */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Debt Category</Label>
            <DebtCategorySelect value={category} onChange={setCategory} />
          </div>

          {/* Debt Name */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Debt Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 py-6 rounded-md"
                placeholder="Enter debt name"
                required
              />
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-gray-700 font-medium">Outstanding Balance</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the current outstanding balance from your latest statement</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Wallet className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-10 py-6 rounded-md"
                placeholder="Enter balance amount"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-gray-700 font-medium">Interest Rate (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the Annual Percentage Rate (APR) for this debt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Percent className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="pl-10 py-6 rounded-md"
                placeholder="Enter interest rate"
                required={!useRemainingMonths}
                disabled={useRemainingMonths}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Minimum Payment */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-gray-700 font-medium">Minimum Payment / EMI</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter your fixed monthly payment (EMI) or minimum payment amount</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Coins className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="number"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
                className="pl-10 py-6 rounded-md"
                placeholder="Enter minimum payment"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Next Payment Date */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Next Payment Date</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex">
                <Input
                  type="text"
                  value={formatDateForDisplay(date)}
                  readOnly
                  className="pl-10 py-6 rounded-l-md bg-white flex-1"
                />
                <div className="relative">
                  <Input
                    type="date"
                    value={formatDateForInput(date)}
                    onChange={(e) => e.target.valueAsDate && setDate(e.target.valueAsDate)}
                    className="sr-only"
                    min={formatDateForInput(new Date())}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-full rounded-l-none border-l-0 px-3 py-6"
                    onClick={() => {
                      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                      if (dateInput) {
                        dateInput.showPicker();
                      }
                    }}
                  >
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interest Already Included */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-1">
                    <Label className="font-medium">
                      Interest Already Included
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Turn this on if your loan balance already includes all future interest. Common for personal loans and auto loans in some countries.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-500">
                    The outstanding balance includes all future interest
                  </p>
                </div>
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

              {isInterestIncluded && (
                <div>
                  <Label className="text-sm font-medium">
                    Remaining Months
                  </Label>
                  <Input
                    type="number"
                    value={remainingMonths}
                    onChange={(e) => setRemainingMonths(e.target.value)}
                    placeholder="36"
                    className="mt-1"
                    min="1"
                    required={isInterestIncluded}
                  />
                  
                  {balance && minimumPayment && remainingMonths && interestRate && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <p className="text-sm font-medium text-blue-800">
                        Estimated payoff: {format(addMonths(new Date(), parseInt(remainingMonths)), 'MMMM yyyy')}
                      </p>
                      <p className="text-sm font-medium text-blue-800 mt-1">
                        Original interest rate: {interestRate}%
                      </p>
                      {calculatedPrincipal !== null && (
                        <>
                          <p className="text-sm font-medium text-blue-800 mt-1">
                            Calculated principal: {currencySymbol}{calculatedPrincipal.toLocaleString(undefined, {maximumFractionDigits: 2})}
                          </p>
                          <p className="text-sm font-medium text-blue-800 mt-1">
                            Interest amount: {currencySymbol}{(Number(balance) - calculatedPrincipal).toLocaleString(undefined, {maximumFractionDigits: 2})}
                          </p>
                          
                          <div className="mt-3 flex items-center justify-between">
                            <Label htmlFor="use-principal" className="font-medium text-blue-800">
                              Use principal as balance
                            </Label>
                            <Switch
                              id="use-principal"
                              checked={usePrincipalAsBalance}
                              onCheckedChange={setUsePrincipalAsBalance}
                              size="sm"
                            />
                          </div>
                          {usePrincipalAsBalance && (
                            <p className="text-sm text-blue-600 mt-2">
                              Balance will be updated to the calculated principal amount
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Calculate Interest from Remaining Months */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-1">
                    <Label className="font-medium">
                      Calculate Interest from Remaining Months
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>If you know how many months are left on your loan, we can calculate the interest rate for you.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-500">
                    Calculate interest rate from payment schedule
                  </p>
                </div>
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

              {useRemainingMonths && (
                <div>
                  <Label className="text-sm font-medium">
                    Remaining Months
                  </Label>
                  <Input
                    type="number"
                    value={remainingMonths}
                    onChange={(e) => setRemainingMonths(e.target.value)}
                    placeholder="36"
                    className="mt-1"
                    min="1"
                    required={useRemainingMonths}
                  />
                  
                  {balance && minimumPayment && remainingMonths && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <p className="text-sm font-medium text-blue-800">
                        Estimated payoff: {projectedPayoffDate}
                      </p>
                      {estimatedInterestRate !== null && (
                        <p className="text-sm font-medium text-blue-800 mt-1">
                          Estimated interest rate: {estimatedInterestRate}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 pb-2 px-1">
            <p className="text-sm text-gray-500">
              These advanced options help you correctly set up loans with pre-calculated interest or loans 
              where you may not know the exact interest rate but know the payoff timeline.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        type="submit" 
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-6"
      >
        Add Debt
      </Button>
    </form>
  );
};

export default AddDebtForm;
