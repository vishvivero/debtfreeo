import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        <TableHead className="text-center">Payoff Date</TableHead>
        <TableHead className="text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};