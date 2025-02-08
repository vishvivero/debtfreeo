
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DebtTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-center">Banking Institution</TableHead>
        <TableHead className="text-center">Debt Name</TableHead>
        <TableHead className="text-center">Balance</TableHead>
        <TableHead className="text-center">Interest Rate</TableHead>
        <TableHead className="text-center">Minimum Payment</TableHead>
        <TableHead className="text-center">Total Interest Paid</TableHead>
        <TableHead className="text-center">Months to Payoff</TableHead>
        <TableHead className="text-center">
          <div className="flex items-center justify-center gap-1">
            Payoff Date
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated date when this debt will be fully paid off</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableHead>
        <TableHead className="text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
