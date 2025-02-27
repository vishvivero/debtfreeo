import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { parseISO } from "date-fns";
import { TimelineTooltip } from "./TimelineTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, isSameMonthAndYear } from "@/lib/utils/dateUtils";
interface TimelineChartProps {
  data: any[];
  debts: any[];
  formattedFundings: OneTimeFunding[];
}
export const TimelineChart = ({
  data,
  debts,
  formattedFundings
}: TimelineChartProps) => {
  // Find data points that have one-time payments
  const oneTimePaymentMonths = data.filter(d => d.oneTimePayment).map(d => d.monthLabel).filter((value, index, self) => self.indexOf(value) === index); // Deduplicate

  // Helper to highlight one-time funding dates
  const isOneTimeFundingMonth = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return formattedFundings.some(funding => {
        return isSameMonthAndYear(date, funding.payment_date);
      });
    } catch (error) {
      console.error('Error checking funding date:', error);
      return false;
    }
  };
  return <div className="space-y-4">
      {/* Payment Legend - Only show when there are one-time payments */}
      {oneTimePaymentMonths.length > 0}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          {oneTimePaymentMonths.length > 0 && <div className="text-sm">
              <span className="font-medium">One-time payments in: </span>
              {oneTimePaymentMonths.map((month, i) => <Badge key={i} variant="outline" className="ml-1 bg-purple-100 text-purple-800">
                  {month}
                </Badge>)}
            </div>}
        </div>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{
          top: 30,
          right: 30,
          left: 0,
          bottom: 20
        }}>
            <defs>
              <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="acceleratedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={true} stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{
            fontSize: 12,
            fill: '#6B7280'
          }} tickLine={{
            stroke: '#9CA3AF'
          }} tickFormatter={value => {
            try {
              if (!value) return '';
              return formatDate(value, 'MMM yyyy');
            } catch (error) {
              console.error('Error formatting date:', error);
              return '';
            }
          }} interval="preserveStartEnd" minTickGap={30} />
            <YAxis tickFormatter={value => `${debts[0].currency_symbol}${value.toLocaleString()}`} tick={{
            fontSize: 12,
            fill: '#6B7280'
          }} tickLine={{
            stroke: '#9CA3AF'
          }} />
            <Tooltip content={<TimelineTooltip />} />
            <Legend formatter={value => {
            if (value === "Original Timeline") {
              return <span className="text-gray-600">Original Timeline</span>;
            }
            if (value === "Accelerated Timeline") {
              return <span className="text-emerald-600 font-medium">Accelerated Timeline</span>;
            }
            return value;
          }} />
            
            {/* Render reference lines for one-time funding payments */}
            {formattedFundings.map((funding, index) => {
            // Find the data point that matches this funding date
            const matchingPoint = data.find(d => d.oneTimePayment && isSameMonthAndYear(d.date, funding.payment_date));
            if (!matchingPoint) return null;
            const strokeStyle = {
              stroke: "#9333EA",
              strokeWidth: 2,
              strokeDasharray: "5 5"
            };
            return <ReferenceLine key={index} x={matchingPoint.date} {...strokeStyle} label={{
              value: `${debts[0].currency_symbol}${Number(funding.amount).toLocaleString()}`,
              position: 'top',
              fill: '#9333EA',
              fontSize: 12,
              fontWeight: 'bold',
              offset: 10
            }} />;
          })}
            
            <Area type="monotone" dataKey="baselineBalance" name="Original Timeline" stroke="#94A3B8" strokeWidth={2} fillOpacity={1} fill="url(#baselineGradient)" dot={false} />
            <Area
          // Use monotone for a smoother curve
          type="monotone" dataKey="acceleratedBalance" name="Accelerated Timeline" stroke="#34D399" strokeWidth={2} fillOpacity={1} fill="url(#acceleratedGradient)" dot={props => {
            // Check if this data point corresponds to a funding date
            if (!props || !props.payload) return null;

            // Draw special dots for one-time payment points
            if (props.payload.oneTimePayment) {
              return <circle cx={props.cx} cy={props.cy} r={5} fill="#9333EA" stroke="#FFFFFF" strokeWidth={2} />;
            }
            return null;
          }} activeDot={{
            r: 6,
            fill: "#34D399",
            stroke: "#FFFFFF",
            strokeWidth: 2
          }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Show savings impact when one-time payments exist */}
      {oneTimePaymentMonths.length > 0 && <div className="bg-gradient-to-r from-purple-50 to-green-50 p-3 rounded-md text-sm">
          <p className="font-medium text-gray-700 mb-1">Impact of One-Time Payments</p>
          <p className="text-gray-600">
            Your {formattedFundings.length > 1 ? `${formattedFundings.length} one-time payments` : "one-time payment"} create{formattedFundings.length > 1 ? "" : "s"} drops in the accelerated timeline, 
            showing an immediate reduction in your debt balance that accelerates your payoff.
          </p>
        </div>}
    </div>;
};