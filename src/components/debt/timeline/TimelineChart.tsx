
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/lib/types/payment";
import { format, parseISO, addMonths } from "date-fns";

interface TimelineChartProps {
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
    
    // Calculate weighted average interest rate based on debt balances
    const weightedInterestRate = debts.reduce((sum, debt) => {
      return sum + (debt.interest_rate * (debt.balance / totalInitialBalance));
    }, 0);
    const monthlyInterestRate = weightedInterestRate / 1200; // Convert annual rate to monthly

    // Calculate required monthly payments to fully amortize the debt
    const baselineMonthlyPayment = (totalInitialBalance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, baselineMonths)) / 
      (Math.pow(1 + monthlyInterestRate, baselineMonths) - 1);
    const acceleratedMonthlyPayment = (totalInitialBalance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, acceleratedMonths)) / 
      (Math.pow(1 + monthlyInterestRate, acceleratedMonths) - 1);

    let baselineBalance = totalInitialBalance;
    let acceleratedBalance = totalInitialBalance;

    const data = Array.from({ length: maxMonths + 1 }, (_, index) => {
      const date = addMonths(startDate, index);

      // First data point should show initial balance
      if (index === 0) {
        return {
          date: format(date, 'yyyy-MM-dd'),
          baselineBalance: totalInitialBalance,
          acceleratedBalance: totalInitialBalance
        };
      }

      // Calculate remaining balance with amortization
      const baselineInterest = baselineBalance * monthlyInterestRate;
      baselineBalance = Math.max(0, baselineBalance + baselineInterest - baselineMonthlyPayment);

      const acceleratedInterest = acceleratedBalance * monthlyInterestRate;
      acceleratedBalance = Math.max(0, acceleratedBalance + acceleratedInterest - acceleratedMonthlyPayment);

      return {
        date: format(date, 'yyyy-MM-dd'),
        baselineBalance: Math.round(baselineBalance * 100) / 100,
        acceleratedBalance: Math.round(acceleratedBalance * 100) / 100
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
