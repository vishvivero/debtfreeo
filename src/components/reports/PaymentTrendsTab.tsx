
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { PaymentTrendsChart } from "./PaymentTrendsChart";
import { generatePaymentTrendsPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { DebtRepaymentPlan } from "@/components/strategy/DebtRepaymentPlan";
import { useDebts } from "@/hooks/use-debts";
import { strategies } from "@/lib/strategies";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentTrendsTabProps {
  payments: any[];
}

export const PaymentTrendsTab = ({ payments }: PaymentTrendsTabProps) => {
  const { toast } = useToast();
  const { debts, profile } = useDebts();
  const isMobile = useIsMobile();

  const handleDownloadReport = () => {
    try {
      const doc = generatePaymentTrendsPDF(
        debts || [],
        profile?.monthly_payment || 0,
        0,
        0,
        0,
        0,
        0,
        strategies[0],
        [],
        profile?.preferred_currency || '£'
      );
      doc.save('payment-trends-report.pdf');
      
      toast({
        title: "Success",
        description: "Payment trends report downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full pb-6 sm:pb-12">
      <Card className="w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Payment Trends</CardTitle>
          <CardDescription className="text-sm">Analysis of your payment history and trends</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="w-full">
              <PaymentTrendsChart payments={payments} />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <Button 
                className="w-full flex items-center gap-2 text-sm"
                onClick={handleDownloadReport}
              >
                <FileDown className="h-4 w-4" />
                Download Trends Report
              </Button>
              <ScrollArea className="h-[150px] sm:h-[200px] w-full rounded-md border p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-4">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                      <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                      <span>£{payment.total_payment.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-4 sm:my-8" />

      {debts && profile && (
        <Card className="w-full overflow-hidden">
          <CardContent className="p-3 sm:p-6">
            <DebtRepaymentPlan
              debts={debts}
              totalMonthlyPayment={profile.monthly_payment || 0}
              selectedStrategy={strategies.find(s => s.id === profile.selected_strategy) || strategies[0]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
