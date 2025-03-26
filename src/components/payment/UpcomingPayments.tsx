
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Debt } from "@/lib/types/debt";
import { addMonths, format, isBefore, isAfter } from "date-fns";
import { CalendarDays, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaymentDialog } from "./PaymentDialog";

interface UpcomingPaymentsProps {
  debts: Debt[];
}

export function UpcomingPayments({ debts }: UpcomingPaymentsProps) {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const today = new Date();
  
  // Filter active debts and sort by next payment date
  const activeDebts = debts
    .filter(debt => debt.status === 'active')
    .sort((a, b) => {
      const dateA = a.next_payment_date ? new Date(a.next_payment_date) : new Date();
      const dateB = b.next_payment_date ? new Date(b.next_payment_date) : new Date();
      return dateA.getTime() - dateB.getTime();
    });

  const getPaymentStatus = (debt: Debt) => {
    if (!debt.next_payment_date) return "unknown";
    
    const nextPaymentDate = new Date(debt.next_payment_date);
    const dueDate = new Date(nextPaymentDate);
    const threeDaysBefore = new Date(nextPaymentDate);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
    
    if (isAfter(today, dueDate)) {
      return "overdue";
    } else if (isAfter(today, threeDaysBefore)) {
      return "upcoming";
    }
    
    return "scheduled";
  };

  const handleRecordPayment = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Upcoming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDebts.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No upcoming payments to display.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debt Name</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDebts.map((debt) => {
                    const status = getPaymentStatus(debt);
                    const paymentDate = debt.next_payment_date 
                      ? new Date(debt.next_payment_date) 
                      : new Date();
                    
                    return (
                      <TableRow key={debt.id}>
                        <TableCell className="font-medium">
                          {debt.name}
                        </TableCell>
                        <TableCell>
                          {debt.next_payment_date 
                            ? format(paymentDate, 'MMM d, yyyy')
                            : 'Not scheduled'}
                        </TableCell>
                        <TableCell className="font-mono">
                          {debt.currency_symbol}{debt.minimum_payment.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {status === "overdue" && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Overdue
                            </Badge>
                          )}
                          {status === "upcoming" && (
                            <Badge variant="outline" className="flex items-center gap-1 bg-amber-500 text-white">
                              <AlertCircle className="h-3 w-3" />
                              Due Soon
                            </Badge>
                          )}
                          {status === "scheduled" && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Scheduled
                            </Badge>
                          )}
                          {status === "unknown" && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              Unknown
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRecordPayment(debt)}
                            className="flex items-center gap-1"
                          >
                            <DollarSign className="h-3 w-3" />
                            Record Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentDialog 
        debt={selectedDebt} 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen} 
      />
    </>
  );
}
