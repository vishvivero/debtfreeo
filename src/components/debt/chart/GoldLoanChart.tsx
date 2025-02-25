
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface GoldLoanChartProps {
  balance: number;
  interestRate: number;
  loanTerm: number;
  currencySymbol: string;
  finalPaymentDate: string;
}

export const GoldLoanChart = ({ 
  balance, 
  interestRate, 
  loanTerm,
  currencySymbol,
  finalPaymentDate
}: GoldLoanChartProps) => {
  const monthlyInterest = (balance * interestRate) / 100 / 12;
  const totalInterest = monthlyInterest * loanTerm;
  
  const data = [
    { name: 'Principal', value: balance, color: '#34D399' },
    { name: 'Total Interest', value: totalInterest, color: '#818CF8' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Monthly Interest</p>
              <p className="text-lg font-semibold">{currencySymbol}{monthlyInterest.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Interest</p>
              <p className="text-lg font-semibold">{currencySymbol}{totalInterest.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Principal Due</p>
              <p className="text-lg font-semibold">{currencySymbol}{balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="text-lg font-semibold">{format(new Date(finalPaymentDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
