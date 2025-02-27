
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
import { addMonths, format } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";
import { formatDate } from "@/lib/utils/dateUtils";

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

  // Format date to display
  const formatDateForDisplay = (date: Date) => {
    return format(date, 'MM/dd/yyyy');
  };

  // Format date for input value
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Form Layout - Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Debt Category */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Debt Category</Label>
            <DebtCategorySelect value={category} onChange={setCategory} />
          </div>

          {/* Debt Name */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Debt Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-8 py-2 h-10 text-sm"
                placeholder="Enter debt name"
                required
              />
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label className="text-sm text-gray-700">Balance</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Enter the current outstanding balance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <Wallet className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-8 py-2 h-10 text-sm"
                placeholder="Enter balance amount"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Interest Rate */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label className="text-sm text-gray-700">Interest Rate (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Enter the Annual Percentage Rate (APR)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <Percent className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="pl-8 py-2 h-10 text-sm"
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
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label className="text-sm text-gray-700">Minimum Payment</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Monthly payment amount</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <Coins className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
                className="pl-8 py-2 h-10 text-sm"
                placeholder="Enter minimum payment"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Next Payment Date */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Next Payment Date</Label>
            <div className="flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="date"
                  value={formatDateForInput(date)}
                  onChange={(e) => {
                    if (e.target.valueAsDate) {
                      setDate(e.target.valueAsDate);
                    }
                  }}
                  className="pl-8 py-2 h-10 text-sm"
                  min={formatDateForInput(new Date())}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options Collapsible */}
      <Collapsible
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
        className="border rounded-md border-gray-200 overflow-hidden"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm">
          <div className="flex items-center gap-1">
            <Calculator className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">Advanced Options</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-3 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interest Already Included */}
            <div className="p-3 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-1">
                    <Label className="text-sm font-medium">
                      Interest Already Included
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Turn on if balance includes future interest</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-gray-500">
                    Balance includes all future interest
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
                  size="sm"
                />
              </div>

              {isInterestIncluded && (
                <div>
                  <Label className="text-xs font-medium">Remaining Months</Label>
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
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div>
                          <p className="text-xs font-medium text-blue-800">Payoff:</p>
                          <p className="text-xs text-blue-600">
                            {format(addMonths(new Date(), parseInt(remainingMonths)), 'MMM yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-800">Interest:</p>
                          <p className="text-xs text-blue-600">{interestRate}%</p>
                        </div>
                        
                        {calculatedPrincipal !== null && (
                          <>
                            <div>
                              <p className="text-xs font-medium text-blue-800">Principal:</p>
                              <p className="text-xs text-blue-600">
                                {currencySymbol}{calculatedPrincipal.toLocaleString(undefined, {maximumFractionDigits: 2})}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-800">Interest Amount:</p>
                              <p className="text-xs text-blue-600">
                                {currencySymbol}{(Number(balance) - calculatedPrincipal).toLocaleString(undefined, {maximumFractionDigits: 2})}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <Label className="text-xs font-medium text-blue-800">
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
            
            {/* Calculate Interest from Remaining Months */}
            <div className="p-3 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-1">
                    <Label className="text-sm font-medium">
                      Calculate Interest Rate
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Calculate interest from remaining months</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use payment schedule instead
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
                  size="sm"
                />
              </div>

              {useRemainingMonths && (
                <div>
                  <Label className="text-xs font-medium">Remaining Months</Label>
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
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <p className="text-xs font-medium text-blue-800">Payoff:</p>
                          <p className="text-xs text-blue-600">{format(addMonths(new Date(), parseInt(remainingMonths)), 'MMM yyyy')}</p>
                        </div>
                        {estimatedInterestRate !== null && (
                          <div>
                            <p className="text-xs font-medium text-blue-800">Est. Interest:</p>
                            <p className="text-xs text-blue-600">{estimatedInterestRate}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button 
        type="submit" 
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-10"
      >
        Add Debt
      </Button>
    </form>
  );
};

export default AddDebtForm;
