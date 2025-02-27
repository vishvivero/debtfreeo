
import { formatDate } from "@/lib/utils/dateUtils";

interface TimelineTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const TimelineTooltip = ({ active, payload, label }: TimelineTooltipProps) => {
  if (!active || !payload || !payload.length || !label) {
    return null;
  }

  try {
    const baselineBalance = payload[0]?.value;
    const acceleratedBalance = payload[1]?.value;
    const currencySymbol = payload[0]?.payload?.currencySymbol || '£';
    const date = formatDate(label, 'MMMM yyyy');
    const oneTimePayment = payload[0]?.payload?.oneTimePayment;
    const difference = Math.max(0, baselineBalance - acceleratedBalance);
    const percentSaved = baselineBalance > 0 ? ((difference / baselineBalance) * 100).toFixed(1) : "0.0";
    
    return (
      <div className={`bg-white p-3 shadow-md rounded-md border border-gray-200 max-w-[280px] ${
        oneTimePayment ? 'border-l-4 border-l-purple-500' : ''
      }`}>
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-gray-700">{date}</p>
          {oneTimePayment && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              One-Time Payment
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-gray-600">Original Balance</span>
            <span className="text-sm font-medium text-gray-700">
              {currencySymbol}{baselineBalance?.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between gap-4">
            <span className="text-sm text-emerald-600">Accelerated Balance</span>
            <span className="text-sm font-medium text-emerald-600">
              {currencySymbol}{acceleratedBalance?.toLocaleString()}
            </span>
          </div>
          
          {oneTimePayment && (
            <div className="flex justify-between gap-4 pt-1 border-t mt-1">
              <span className="text-sm text-purple-600 font-medium">One-Time Payment</span>
              <span className="text-sm font-medium text-purple-600">
                {currencySymbol}{oneTimePayment?.toLocaleString()}
              </span>
            </div>
          )}
          
          {/* Difference display with percentage */}
          <div className="flex justify-between gap-4 pt-1 border-t mt-1">
            <span className="text-sm text-gray-600">Savings</span>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-emerald-600">
                {currencySymbol}{difference.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-500">
                ({percentSaved}% of original)
              </span>
            </div>
          </div>
          
          {/* Summary information */}
          {oneTimePayment && (
            <div className="mt-2 pt-2 border-t text-xs text-purple-700">
              This one-time payment of {currencySymbol}{oneTimePayment.toLocaleString()} accelerates your debt payoff timeline.
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering tooltip:', error);
    return (
      <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
        <p>Error displaying tooltip data</p>
      </div>
    );
  }
};
