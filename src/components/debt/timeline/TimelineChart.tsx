
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/lib/types/payment";
import { format, parseISO, addMonths, isEqual } from "date-fns";

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
    
    // Sort debts by interest rate (highest first) for avalanche strategy
    const sortedDebts = [...debts].sort((a, b) => b.interest_rate - a.interest_rate);

    // Calculate total minimum payment
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    const data = Array.from({ length: maxMonths + 1 }, (_, index) => {
      const currentDate = addMonths(startDate, index);
      
      // First data point should show initial balance for both scenarios
      if (index === 0) {
        return {
          date: format(currentDate, 'yyyy-MM-dd'),
          baselineBalance: totalInitialBalance,
          acceleratedBalance: totalInitialBalance
        };
      }

      // Process baseline scenario (minimum payments only)
      let totalBaselineBalance = 0;
      debtBalances.forEach((balance, debtId) => {
        const debt = debts.find(d => d.id === debtId)!;
        if (balance > 0) {
          const monthlyInterest = (balance * debt.interest_rate) / 1200;
          const payment = Math.min(balance + monthlyInterest, debt.minimum_payment);
          const newBalance = Math.max(0, balance + monthlyInterest - payment);
          debtBalances.set(debtId, newBalance);
          totalBaselineBalance += newBalance;
        }
      });

      // Process accelerated scenario
      let totalAcceleratedBalance = 0;
      let availablePayment = totalMinimumPayment;

      // Add one-time fundings for this month
      const fundingsForMonth = oneTimeFundings.filter(funding => {
        const fundingDate = new Date(funding.payment_date);
        return fundingDate.getMonth() === currentDate.getMonth() && 
               fundingDate.getFullYear() === currentDate.getFullYear();
      });
      
      const totalFundingAmount = fundingsForMonth.reduce((sum, funding) => 
        sum + Number(funding.amount), 0);
      availablePayment += totalFundingAmount;

      // First, apply minimum payments to all debts
      for (const debt of sortedDebts) {
        const currentBalance = acceleratedDebtBalances.get(debt.id)!;
        if (currentBalance > 0) {
          const monthlyInterest = (currentBalance * debt.interest_rate) / 1200;
          const minimumPayment = Math.min(currentBalance + monthlyInterest, debt.minimum_payment);
          availablePayment -= minimumPayment;
          
          // Apply minimum payment
          let newBalance = currentBalance + monthlyInterest - minimumPayment;
          acceleratedDebtBalances.set(debt.id, newBalance);
          totalAcceleratedBalance += newBalance;
        }
      }

      // Then, apply any remaining payment to highest interest debt
      if (availablePayment > 0) {
        for (const debt of sortedDebts) {
          const currentBalance = acceleratedDebtBalances.get(debt.id)!;
          if (currentBalance > 0) {
            const extraPayment = Math.min(availablePayment, currentBalance);
            const newBalance = Math.max(0, currentBalance - extraPayment);
            acceleratedDebtBalances.set(debt.id, newBalance);
            availablePayment -= extraPayment;
            totalAcceleratedBalance = Array.from(acceleratedDebtBalances.values()).reduce((sum, bal) => sum + bal, 0);
            
            if (availablePayment <= 0) break;
          }
        }
      }

      return {
        date: format(currentDate, 'yyyy-MM-dd'),
        baselineBalance: Math.round(totalBaselineBalance * 100) / 100,
        acceleratedBalance: Math.round(totalAcceleratedBalance * 100) / 100
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
