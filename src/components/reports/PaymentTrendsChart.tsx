
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentTrendsChartProps {
  payments: any[];
}

export const PaymentTrendsChart = ({ payments }: PaymentTrendsChartProps) => {
  const isMobile = useIsMobile();
  
  const paymentData = payments?.map(payment => ({
    date: new Date(payment.payment_date).toLocaleDateString(),
    amount: Number(payment.total_payment),
  })) || [];

  return (
    <div className="h-[250px] sm:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={paymentData} 
          margin={{ 
            top: 10, 
            right: isMobile ? 5 : 10, 
            left: isMobile ? -15 : 0, 
            bottom: 10 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: isMobile ? 10 : 12 }} 
            tickFormatter={(value) => {
              const parts = value.split('/');
              // On mobile, use shorter date format
              if (isMobile) {
                return parts.length > 1 ? `${parts[1]}/${parts[0].substring(0, 2)}` : value;
              }
              return parts.length > 1 ? `${parts[1]}/${parts[0]}` : value;
            }}
            interval={isMobile ? 'preserveStartEnd' : 0}
          />
          <YAxis 
            tick={{ fontSize: isMobile ? 10 : 12 }} 
            tickFormatter={(value) => value.toLocaleString()} 
            width={isMobile ? 40 : 60}
          />
          <Tooltip 
            formatter={(value: any) => [`${value.toLocaleString()}`, 'Payment Amount']} 
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ fontSize: isMobile ? '10px' : '12px' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} 
            height={isMobile ? 15 : 20}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#34D399"
            name="Payment Amount"
            strokeWidth={isMobile ? 1.5 : 2}
            dot={{ r: isMobile ? 3 : 4 }}
            activeDot={{ r: isMobile ? 5 : 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
