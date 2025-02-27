
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebts } from "@/hooks/use-debts";
import { CreditCard, Calendar, Crown, Info, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
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

export interface AddDebtFormProps {
  onAddDebt?: (debt: any) => void;
  currencySymbol?: string;
  onClose?: () => void;
}

export const AddDebtForm = ({ onAddDebt, currencySymbol = "£", onClose }: AddDebtFormProps) => {
  const { addDebt } = useDebts();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Credit Card");
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  
  // Advanced options
  const [isInterestIncluded, setIsInterestIncluded] = useState(false);
  const [remainingMonths, setRemainingMonths] = useState("");
  const [useRemainingMonths, setUseRemainingMonths] = useState(false);
  const [calculatedPrincipal, setCalculatedPrincipal] = useState<number | null>(null);
  const [usePrincipalAsBalance, setUsePrincipalAsBalance] = useState(false);
  
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

  // Calculate estimated interest rate if possible
  const estimatedInterestRate = useRemainingMonths && balance && minimumPayment && remainingMonths ? 
    calculateEstimatedInterestRate(
      Number(balance), 
      Number(minimumPayment), 
      Number(remainingMonths)
    ) : null;

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
          notes: notes || null
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
      setNotes("");
      setIsInterestIncluded(false);
      setRemainingMonths("");
      setUseRemainingMonths(false);
      setUsePrincipalAsBalance(false);
      
      // Close the dialog if onClose is provided
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
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <div className="px-6">
              <TabsList className="h-14 bg-transparent space-x-8 p-0">
                <TabsTrigger 
                  value="details" 
                  className="text-base font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none h-14 px-1 bg-transparent"
                >
                  Loan Description
                </TabsTrigger>
                <TabsTrigger 
                  value="terms" 
                  className="text-base font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none h-14 px-1 bg-transparent"
                >
                  Terms
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="text-base font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none h-14 px-1 bg-transparent"
                >
                  Payment Details
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="p-6">
            <TabsContent value="details" className="mt-0 space-y-4">
              {/* Debt Name */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Debt Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-gray-300"
                  placeholder="E.g. Personal Loan, Credit Card, etc."
                  required
                />
              </div>

              {/* Debt Category */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Debt Category</Label>
                <DebtCategorySelect value={category} onChange={setCategory} />
              </div>
            </TabsContent>

            <TabsContent value="terms" className="mt-0 space-y-4">
              {/* Balance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 font-medium">Current Balance</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <HelpCircle className="h-5 w-5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the current outstanding balance from your latest statement</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">{currencySymbol}</span>
                  </div>
                  <Input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="pl-8 border-gray-300"
                    placeholder="Enter balance amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 font-medium">Interest Rate (%)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <HelpCircle className="h-5 w-5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the Annual Percentage Rate (APR) for this debt</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="border-gray-300"
                    placeholder="E.g. 5.99"
                    required={!useRemainingMonths}
                    disabled={useRemainingMonths}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="mt-0 space-y-4">
              {/* Minimum Payment */}
              <div>
                <div className="mb-1 text-gray-600">Minimum payment calculation</div>
                <div className="text-xl text-gray-700 font-normal mb-4">Fixed amount</div>
                <div className="border-t border-gray-200 pt-4"></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label className="text-gray-700 font-medium">Minimum payment *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1 cursor-help">
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter your fixed monthly payment (EMI) or minimum payment amount</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">{currencySymbol}</span>
                  </div>
                  <Input
                    type="number"
                    value={minimumPayment}
                    onChange={(e) => setMinimumPayment(e.target.value)}
                    className="pl-8 border-gray-300"
                    placeholder="Enter minimum payment"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="mb-1 text-gray-600">Payment frequency</div>
                <div className="text-xl text-gray-700 font-normal mb-4 flex items-center">
                  Once per month
                  <div className="ml-auto">
                    <Crown className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4"></div>
              </div>

              {/* Next Payment Date */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label className="text-gray-700 font-medium">Next payment due date *</Label>
                </div>
                <div className="relative">
                  <Input
                    type="date"
                    value={formatDateForInput(date)}
                    onChange={(e) => {
                      if (e.target.valueAsDate) {
                        setDate(e.target.valueAsDate);
                      }
                    }}
                    className="border-gray-300"
                    min={formatDateForInput(new Date())}
                    required
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="mb-1 text-gray-600">Custom note</div>
                <div className="border-t border-gray-200 pt-4"></div>
                <div className="relative">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any additional notes about this debt..."
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {notes.length}/500
                  </div>
                  <div className="absolute top-2 right-2">
                    <Crown className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="mt-auto flex justify-between items-center p-6 border-t">
        <Button 
          type="button" 
          variant="outline"
          className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={() => {
            // Handle cancel/delete action
            if (onClose) {
              onClose();
            }
          }}
        >
          Delete
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-10"
        >
          Save changes
        </Button>
      </div>
    </form>
  );
};

export default AddDebtForm;
