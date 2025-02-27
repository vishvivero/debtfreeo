
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { format, parseISO } from "date-fns";
import { TimelineTooltip } from "./TimelineTooltip";

interface TimelineChartProps {
  data: any[];
  debts: any[];
  formattedFundings: OneTimeFunding[];
}

export const TimelineChart = ({ data, debts, formattedFundings }: TimelineChartProps) => {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
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
            tickFormatter={(value) => `${debts[0].currency_symbol}${value.toLocaleString()}`}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#9CA3AF' }}
          />
          <Tooltip content={<TimelineTooltip />} />
          <Legend />
          
          {/* Render reference lines for one-time funding payments */}
          {formattedFundings.map((funding, index) => (
            <ReferenceLine
              key={index}
              x={funding.payment_date}
              stroke="#9333EA"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: `${debts[0].currency_symbol}${funding.amount.toLocaleString()}`,
                position: 'top',
                fill: '#9333EA',
                fontSize: 12,
                fontWeight: 'bold',
                offset: 10
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
            dot={(props) => {
              // Check if this data point corresponds to a funding date
              if (!props || !props.payload) return null;
              
              const dataDate = props.payload.date;
              // Check if this is a funding date
              const fundingIndex = formattedFundings.findIndex(f => f.payment_date === dataDate);
              
              if (fundingIndex >= 0) {
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={5}
                    fill="#9333EA"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              }
              return null;
            }}
            activeDot={{ r: 6, fill: "#34D399", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
