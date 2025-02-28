
import { useState, useEffect } from "react";
import { useDebts } from "@/hooks/use-debts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Debt } from "@/lib/types/debt";
import { FolderIcon, CreditCard, Percent, Wallet, Coins, Info, Calculator, Calendar, ChevronDown } from "lucide-react";
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
import { CurrencySelector } from "@/components/profile/CurrencySelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCurrencies } from "@/lib/utils/currency-data";

interface EditDebtFormProps {
  debt: Debt;
  onSubmit: (updatedDebt: Debt) => void;
}

export const EditDebtForm = ({ debt, onSubmit }: EditDebtFormProps) => {
  const { updateDebt } = useDebts();
  const { toast } = useToast();
  const [name, setName] = useState(debt.name);
  const [category, setCategory] = useState(debt.category || "Credit Card");
  const [balance, setBalance] = useState(debt.balance.toString());
  const [interestRate, setInterestRate] = useState(debt.metadata?.original_rate?.toString() || debt.interest_rate.toString());
  const [minimumPayment, setMinimumPayment] = useState(debt.minimum_payment.toString());
  const [bankerName, setBankerName] = useState(debt.banker_name);
  const [currencySymbol, setCurrencySymbol] = useState(debt.currency_symbol);
  const [date, setDate] = useState<Date>(new Date(debt.next_payment_date || new Date()));
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced options
  const metadata = debt.metadata || {};
  const [isInterestIncluded, setIsInterestIncluded] = useState(metadata.interest_included || false);
  const [remainingMonths, setRemainingMonths] = useState(metadata.remaining_months?.toString() || "");
  const [useRemainingMonths, setUseRemainingMonths] = useState(!!metadata.remaining_months && !metadata.interest_included);
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
      console.log("Calculated principal:", principal);
      
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
        console.log("Using calculated interest rate:", finalInterestRate);
      }

      // Determine the final balance to use (either original or principal)
      const finalBalance = usePrincipalAsBalance && calculatedPrincipal !== null
        ? calculatedPrincipal
        : Number(balance);

      const updatedDebt = {
        ...debt,
        name,
        balance: finalBalance,
        interest_rate: finalInterestRate,
        minimum_payment: Number(minimumPayment),
        banker_name: bankerName,
        currency_symbol: currencySymbol,
        category,
        next_payment_date: date.toISOString(),
        metadata: {
          ...debt.metadata,
          interest_included: isInterestIncluded,
          remaining_months: (isInterestIncluded || useRemainingMonths) ? Number(remainingMonths) : null,
          original_rate: isInterestIncluded ? finalInterestRate : null,
          total_with_interest: isInterestIncluded && !usePrincipalAsBalance ? Number(balance) : null,
        }
      };

      console.log("Updating debt with data:", updatedDebt);

      await updateDebt.mutateAsync(updatedDebt);
      toast({
        title: "Success",
        description: "Debt updated successfully",
      });
      onSubmit(updatedDebt);
    } catch (error) {
      console.error("Error updating debt:", error);
      toast({
        title: "Error",
        description: "Failed to update debt",
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

  // Find the selected currency details
  const selectedCurrency = countryCurrencies.find(item => item.symbol === currencySymbol);
  const currencyDisplayText = selectedCurrency ? 
    `${currencySymbol} ${selectedCurrency.country} - ${selectedCurrency.currency}` : 
    currencySymbol;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="space-y-6">
        {/* Debt Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base text-gray-700 font-medium">Debt Category</Label>
          <div className="relative rounded-md border border-gray-200">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <FolderIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="pl-10 py-6 h-auto text-base rounded-md border-0 shadow-none">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                <SelectItem value="Student Loan">Student Loan</SelectItem>
                <SelectItem value="Mortgage">Mortgage</SelectItem>
                <SelectItem value="Auto Loan">Auto Loan</SelectItem>
                <SelectItem value="Medical Debt">Medical Debt</SelectItem>
                <SelectItem value="Business Loan">Business Loan</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Debt Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base text-gray-700 font-medium">Debt Name</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 py-6 h-auto text-base rounded-md"
              placeholder="Enter debt name"
              required
            />
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="currency" className="text-base text-gray-700 font-medium">Currency</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Select the currency for this debt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={currencySymbol} onValueChange={setCurrencySymbol}>
            <SelectTrigger id="currency" className="py-6 h-auto text-base rounded-md">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {countryCurrencies.map((item) => (
                <SelectItem key={item.symbol} value={item.symbol}>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{item.symbol}</span>
                    <span>{item.country} - {item.currency}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="balance" className="text-base text-gray-700 font-medium">Balance</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Enter the current outstanding balance from your latest statement</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Wallet className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="pl-10 py-6 h-auto text-base rounded-md"
              placeholder="Enter balance amount"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="interestRate" className="text-base text-gray-700 font-medium">Interest Rate (%)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Enter the Annual Percentage Rate (APR) for this debt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Percent className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="interestRate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="pl-10 py-6 h-auto text-base rounded-md"
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
          <div className="flex items-center gap-2">
            <Label htmlFor="minimumPayment" className="text-base text-gray-700 font-medium">Minimum Payment</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Enter your fixed monthly payment (EMI) or minimum payment amount</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Coins className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="minimumPayment"
              type="number"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(e.target.value)}
              className="pl-10 py-6 h-auto text-base rounded-md"
              placeholder="Enter minimum payment"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Next Payment Date */}
        <div className="space-y-2">
          <Label htmlFor="nextPaymentDate" className="text-base text-gray-700 font-medium">Next Payment Date</Label>
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={formatDateForDisplay(date)}
                readOnly
                className="pl-10 py-6 h-auto text-base rounded-l-md"
              />
            </div>
            <div className="relative">
              <Input
                id="nextPaymentDate"
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
                className="h-full rounded-l-none border-l-0 px-4 py-6"
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

        {/* Advanced Options */}
        <Collapsible
          open={showAdvanced}
          onOpenChange={setShowAdvanced}
          className="border rounded-md border-gray-200"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-500" />
              <span className="font-medium text-base">Advanced Options</span>
            </div>
            <ChevronDown className="h-5 w-5 transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              {/* Left column - Interest Already Included */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
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
                            <p>Turn this on if your loan balance already includes all future interest</p>
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
                  <div className="mt-2">
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
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                        <p className="font-medium text-blue-800">
                          Estimated payoff: {format(addMonths(new Date(), parseInt(remainingMonths)), 'MMMM yyyy')}
                        </p>
                        {calculatedPrincipal !== null && (
                          <>
                            <p className="font-medium text-blue-800 mt-1">
                              Principal: {currencySymbol}{calculatedPrincipal.toLocaleString()}
                            </p>
                            
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
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right column - Calculate Interest from Remaining Months */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
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
                            <p>Calculate interest rate from your payment schedule</p>
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
                  <div className="mt-2">
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
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                        <p className="font-medium text-blue-800">
                          Estimated payoff: {projectedPayoffDate}
                        </p>
                        {estimatedInterestRate !== null && (
                          <p className="font-medium text-blue-800 mt-1">
                            Estimated interest rate: {estimatedInterestRate}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-4 text-base mt-4"
      >
        Save Changes
      </Button>
    </form>
  );
};
