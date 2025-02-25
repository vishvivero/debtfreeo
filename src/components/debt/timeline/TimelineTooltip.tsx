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

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold mb-2">{formattedDate}</p>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Original Balance: {payload[0]?.payload?.currencySymbol}{payload[0]?.value?.toLocaleString()}
          </p>
          <p className="text-sm text-emerald-600">
            Accelerated Balance: {payload[0]?.payload?.currencySymbol}{payload[1]?.value?.toLocaleString()}
          </p>
          {payload[1]?.payload?.oneTimePayment && (
            <p className="text-sm text-purple-600">
              One-time Payment: {payload[0]?.payload?.currencySymbol}{payload[1]?.payload?.oneTimePayment?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};