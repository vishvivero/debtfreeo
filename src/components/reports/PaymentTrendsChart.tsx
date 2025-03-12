
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface PaymentTrendsChartProps {
  payments: any[];
}

export const PaymentTrendsChart = ({ payments }: PaymentTrendsChartProps) => {
  const paymentData = payments?.map(payment => ({
    date: new Date(payment.payment_date).toLocaleDateString(),
    amount: Number(payment.total_payment),
  })) || [];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="99%" height="100%">
        <LineChart 
          data={paymentData} 
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => value.split('/').slice(0, 2).join('/')}
          />
          <YAxis 
            width={50} 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => value.toLocaleString()} 
          />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#34D399"
            name="Payment Amount"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
