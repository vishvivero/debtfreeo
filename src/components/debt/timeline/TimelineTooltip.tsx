
import { format, parseISO } from "date-fns";

interface TimelineTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const TimelineTooltip = ({ active, payload, label }: TimelineTooltipProps) => {
  if (active && payload && payload.length) {
    // Safely parse the date string
    const formattedDate = label ? format(parseISO(label), 'MMMM yyyy') : '';
    
    // Extract values from payload
    const baselineBalance = payload[0]?.value;
    const acceleratedBalance = payload[1]?.value;
    const oneTimePayment = payload[1]?.payload?.oneTimePayment;
    const currencySymbol = payload[0]?.payload?.currencySymbol || '£';
    const baselineInterest = payload[0]?.payload?.baselineInterest;
    const acceleratedInterest = payload[0]?.payload?.acceleratedInterest;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold mb-2">{formattedDate}</p>
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Original Balance: {currencySymbol}{baselineBalance?.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-600">
              Accelerated Balance: {currencySymbol}{acceleratedBalance?.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Original Interest: {currencySymbol}{baselineInterest?.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-500">
              Accelerated Interest: {currencySymbol}{acceleratedInterest?.toLocaleString()}
            </p>
          </div>

          {oneTimePayment && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-purple-600">
                One-time Payment: {currencySymbol}{oneTimePayment?.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
