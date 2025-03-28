
import { useState, useEffect } from "react";
import { useDebts } from "@/hooks/use-debts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Debt } from "@/lib/types/debt";
import { 
  FolderIcon, 
  CreditCard, 
  Percent, 
  Wallet, 
  Coins, 
  Info, 
  Calculator, 
  Calendar, 
  ChevronDown,
  DollarSign
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("basics");
  const [notes, setNotes] = useState(debt.metadata?.notes || "");
  
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
          notes: notes || null
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

  // Handle cancel click - fixed type mismatch
  const handleCancel = () => {
    onSubmit(debt); // Pass the original debt back to close the dialog
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <div className="px-4">
              <TabsList className="h-12 bg-transparent space-x-5 p-0">
                <TabsTrigger 
                  value="basics" 
                  className="text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none h-12 px-1 bg-transparent"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none h-12 px-1 bg-transparent"
                >
                  Advanced Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="currency" 
                  className="text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none h-12 px-1 bg-transparent"
                >
                  Currency
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="p-4">
            <TabsContent value="basics" className="mt-0 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  {/* Debt Name */}
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

                  {/* Balance */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Current Outstanding Balance *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">{currencySymbol}</span>
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

                  {/* Debt Category */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Debt Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="border-gray-300 h-9">
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

                {/* Right Column */}
                <div className="space-y-3">
                  {/* Interest Rate */}
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

                  {/* Minimum Payment */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 text-sm">Minimum Payment/EMI *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">{currencySymbol}</span>
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

                  {/* Next Payment Date */}
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
                {/* Interest Already Included */}
                <div className="p-3 border rounded-md bg-gray-50">
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
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
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
                <div className="p-3 border rounded-md bg-gray-50">
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
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <p className="text-xs font-medium text-blue-800">Payoff Date:</p>
                              <p className="text-xs text-blue-600">{format(addMonths(new Date(), parseInt(remainingMonths)), 'MMM yyyy')}</p>
                            </div>
                            {estimatedInterestRate !== null && (
                              <div>
                                <p className="text-xs font-medium text-blue-800">Est. Interest Rate:</p>
                                <p className="text-xs text-blue-600">{estimatedInterestRate}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="space-y-1">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 h-20 resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any additional notes about this debt..."
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-500">
                    {notes.length}/500
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="currency" className="mt-0">
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center mb-3">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="text-base font-semibold">Select Currency</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the currency for this debt. This will affect how the debt is displayed and calculated.
                  </p>
                  
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Currency</Label>
                    <Select 
                      value={currencySymbol} 
                      onValueChange={setCurrencySymbol}
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

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-sm font-medium text-blue-800">Current Selection:</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xl font-bold text-blue-600 mr-2">{currencySymbol}</span>
                      <span className="text-sm text-blue-700">
                        {countryCurrencies.find(c => c.symbol === currencySymbol)?.country || 'Unknown'} - 
                        {countryCurrencies.find(c => c.symbol === currencySymbol)?.currency || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="mt-auto flex justify-between items-center p-4 border-t">
        <Button 
          type="button" 
          variant="outline"
          className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6"
        >
          Update Debt
        </Button>
      </div>
    </form>
  );
};
