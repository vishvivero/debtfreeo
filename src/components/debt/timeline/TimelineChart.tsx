
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
    
    // Initialize balances for each debt
    const debtBalances = new Map(debts.map(debt => [debt.id, debt.balance]));
    const acceleratedDebtBalances = new Map(debts.map(debt => [debt.id, debt.balance]));
    
    const totalInitialBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    console.log('Timeline calculation setup:', {
      totalInitialBalance,
      totalMinimumPayment,
      baselineMonths,
      acceleratedMonths,
      maxMonths,
      debtsCount: debts.length
    });

    const data = Array.from({ length: maxMonths + 1 }, (_, index) => {
      const currentDate = addMonths(startDate, index);
      
      if (index === 0) {
        return {
          date: format(currentDate, 'yyyy-MM-dd'),
          baselineBalance: totalInitialBalance,
          acceleratedBalance: totalInitialBalance
        };
      }

      // Process baseline scenario (minimum payments only)
      let totalBaselineBalance = 0;
      let baselineFullyPaid = true;
      for (const debt of debts) {
        const currentBalance = debtBalances.get(debt.id)!;
        if (currentBalance > 0) {
          const monthlyInterest = (currentBalance * debt.interest_rate) / 1200;
          const minimumPayment = Math.min(currentBalance + monthlyInterest, debt.minimum_payment);
          const newBalance = Math.max(0, currentBalance + monthlyInterest - minimumPayment);
          debtBalances.set(debt.id, newBalance);
          totalBaselineBalance += newBalance;
          if (newBalance > 0) baselineFullyPaid = false;
        }
      }

      // Process accelerated scenario
      let totalAcceleratedBalance = 0;
      let acceleratedFullyPaid = true;
      let availablePayment = totalMinimumPayment;

      // Add one-time fundings for this month
      const fundingsForMonth = oneTimeFundings.filter(funding => {
        const fundingDate = new Date(funding.payment_date);
        return fundingDate.getMonth() === currentDate.getMonth() && 
               fundingDate.getFullYear() === currentDate.getFullYear();
      });
      
      const totalFundingAmount = fundingsForMonth.reduce((sum, funding) => sum + Number(funding.amount), 0);
      availablePayment += totalFundingAmount;

      // First, apply minimum payments to all debts
      for (const debt of debts) {
        const currentBalance = acceleratedDebtBalances.get(debt.id)!;
        if (currentBalance > 0) {
          const monthlyInterest = (currentBalance * debt.interest_rate) / 1200;
          const minimumPayment = Math.min(currentBalance + monthlyInterest, debt.minimum_payment);
          const newBalance = Math.max(0, currentBalance + monthlyInterest - minimumPayment);
          acceleratedDebtBalances.set(debt.id, newBalance);
          availablePayment -= minimumPayment;
        }
      }

      // Then, apply any extra payments to the debt with highest interest
      if (availablePayment > 0) {
        const sortedDebts = [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
        
        for (const debt of sortedDebts) {
          if (availablePayment <= 0) break;
          
          const currentBalance = acceleratedDebtBalances.get(debt.id)!;
          if (currentBalance > 0) {
            const extraPayment = Math.min(availablePayment, currentBalance);
            const newBalance = Math.max(0, currentBalance - extraPayment);
            acceleratedDebtBalances.set(debt.id, newBalance);
            availablePayment -= extraPayment;
          }
        }
      }

      // Calculate total accelerated balance
      for (const debt of debts) {
        const balance = acceleratedDebtBalances.get(debt.id)!;
        totalAcceleratedBalance += balance;
        if (balance > 0) acceleratedFullyPaid = false;
      }

      console.log(`Month ${index} status:`, {
        date: format(currentDate, 'MMM yyyy'),
        baselineBalance: totalBaselineBalance.toFixed(2),
        acceleratedBalance: totalAcceleratedBalance.toFixed(2),
        baselineFullyPaid,
        acceleratedFullyPaid,
        remainingPayment: availablePayment.toFixed(2)
      });

      // Return the data point, ensuring both scenarios continue until their respective end dates
      return {
        date: format(currentDate, 'yyyy-MM-dd'),
        baselineBalance: index <= baselineMonths ? Math.round(totalBaselineBalance * 100) / 100 : null,
        acceleratedBalance: index <= acceleratedMonths ? Math.round(totalAcceleratedBalance * 100) / 100 : null
      };
    });

    // Find earliest month where both scenarios are paid off
    const findCommonPayoffMonth = (data: any[]) => {
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        if ((point.baselineBalance === 0 || point.baselineBalance === null) && 
            (point.acceleratedBalance === 0 || point.acceleratedBalance === null)) {
          return i;
        }
      }
      return data.length;
    };

    const commonPayoffMonth = findCommonPayoffMonth(data);
    console.log('Found common payoff month:', {
      month: commonPayoffMonth,
      baselineMonths,
      acceleratedMonths
    });

    // Return data up to the point where both scenarios are complete
    return data.slice(0, commonPayoffMonth + 1);
  };

  const chartData = generateTimelineData();

  if (!chartData.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        No data available for timeline chart
      </div>
    );
  }

  // Find the accelerated payoff date
  const acceleratedPayoffDate = chartData.find(point => point.acceleratedBalance === 0)?.date;

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="acceleratedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0FD396" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#E6FEF6" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            vertical={false} 
            horizontal={true} 
            stroke="#E2E8F0" 
            strokeDasharray="3 3"
          />
          <XAxis 
            dataKey="date"
            tick={{ fontSize: 12, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
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
            minTickGap={60}
          />
          <YAxis 
            tickFormatter={(value) => `${currencySymbol}${value.toLocaleString()}`}
            tick={{ fontSize: 12, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            tickCount={6}
          />
          <Tooltip content={<TooltipComponent />} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: '#64748B', fontSize: '14px' }}>
                {value}
              </span>
            )}
          />
          
          {oneTimeFundings.map((funding, index) => (
            <ReferenceLine
              key={index}
              x={format(new Date(funding.payment_date), 'yyyy-MM-dd')}
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

          {acceleratedPayoffDate && (
            <ReferenceLine
              x={acceleratedPayoffDate}
              stroke="#0FD396"
              strokeWidth={2}
              label={{
                value: "Debt-Free!",
                position: 'top',
                fill: '#0FD396',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          )}
          
          <Area
            type="monotone"
            dataKey="baselineBalance"
            name="Original Timeline"
            stroke="#94A3B8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#baselineGradient)"
            dot={false}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="acceleratedBalance"
            name="Accelerated Timeline"
            stroke="#0FD396"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#acceleratedGradient)"
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
