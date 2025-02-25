
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/lib/types/payment";
import { format, parseISO, addMonths } from "date-fns";

interface TimelineChartProps {
  data?: any[];
  debts: Debt[];
  baselineMonths: number;
  acceleratedMonths: number;
  currencySymbol: string;
  oneTimeFundings: OneTimeFunding[];
  customTooltip: any;
}

export const TimelineChart = ({ 
  debts,
  baselineMonths,
  acceleratedMonths,
  currencySymbol,
  oneTimeFundings,
  customTooltip: TooltipComponent 
}: TimelineChartProps) => {
  // Generate timeline data with compound interest
  const generateTimelineData = () => {
    if (!debts.length) return [];

    const startDate = new Date();
    const maxMonths = Math.max(baselineMonths, acceleratedMonths);
    const totalInitialBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length;
    const monthlyInterestRate = avgInterestRate / 1200; // Convert annual rate to monthly

    // Calculate monthly payments
    const baselineMonthlyPayment = totalInitialBalance / baselineMonths;
    const acceleratedMonthlyPayment = totalInitialBalance / acceleratedMonths;

    let baselineBalance = totalInitialBalance;
    let acceleratedBalance = totalInitialBalance;

    const data = Array.from({ length: maxMonths + 1 }, (_, index) => {
      const date = addMonths(startDate, index);

      // Calculate baseline path with interest
      if (index > 0 && baselineBalance > 0) {
        const interest = baselineBalance * monthlyInterestRate;
        baselineBalance = Math.max(0, baselineBalance + interest - baselineMonthlyPayment);
      }

      // Calculate accelerated path with interest
      if (index > 0 && acceleratedBalance > 0) {
        const interest = acceleratedBalance * monthlyInterestRate;
        acceleratedBalance = Math.max(0, acceleratedBalance + interest - acceleratedMonthlyPayment);
      }

      return {
        date: format(date, 'yyyy-MM-dd'),
        baselineBalance: Math.max(0, baselineBalance),
        acceleratedBalance: Math.max(0, acceleratedBalance)
      };
    });

    return data;
  };

  // Format one-time fundings for display
  const formattedFundings = oneTimeFundings.map(funding => ({
    ...funding,
    payment_date: format(new Date(funding.payment_date), 'yyyy-MM-dd')
  }));

  const chartData = generateTimelineData();

  if (!chartData.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        No data available for timeline chart
      </div>
    );
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="acceleratedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#34D399" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} horizontal={true} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#9CA3AF' }}
            tickFormatter={(value) => {
              try {
                if (!value) return '';
                return format(parseISO(value), 'MMM yyyy');
              } catch (error) {
                console.error('Error formatting date:', error);
                return '';
              }
            }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(value) => `${currencySymbol}${value.toLocaleString()}`}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#9CA3AF' }}
            orientation="right"
            domain={['dataMin', 'dataMax']}
            reversed={false}
          />
          <Tooltip content={<TooltipComponent />} />
          <Legend />
          
          {formattedFundings.map((funding, index) => (
            <ReferenceLine
              key={index}
              x={funding.payment_date}
              stroke="#9333EA"
              strokeDasharray="3 3"
              label={{
                value: `${currencySymbol}${funding.amount}`,
                position: 'top',
                fill: '#9333EA',
                fontSize: 12
              }}
            />
          ))}
          
          <Area
            type="monotone"
            dataKey="baselineBalance"
            name="Original Timeline"
            stroke="#94A3B8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#baselineGradient)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="acceleratedBalance"
            name="Accelerated Timeline"
            stroke="#34D399"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#acceleratedGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
