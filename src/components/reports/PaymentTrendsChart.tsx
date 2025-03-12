
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={paymentData} margin={{ right: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis width={60} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#34D399"
            name="Payment Amount"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
