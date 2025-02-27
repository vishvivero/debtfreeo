
import { format, parseISO } from "date-fns";

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
    const date = format(parseISO(label), 'MMMM yyyy');
    const oneTimePayment = payload[0]?.payload?.oneTimePayment;
    const paymentDetails = payload[0]?.payload?.paymentDetails;
    
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200 max-w-[280px]">
        <p className="font-medium text-gray-700 mb-1">{date}</p>
        
        <div className="space-y-1">
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
          
          {/* Difference display */}
          <div className="flex justify-between gap-4 pt-1 border-t mt-1">
            <span className="text-sm text-gray-600">Difference</span>
            <span className="text-sm font-medium text-emerald-600">
              {currencySymbol}{(baselineBalance - acceleratedBalance).toLocaleString()}
            </span>
          </div>
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
