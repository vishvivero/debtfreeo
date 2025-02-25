
import { format, parseISO } from "date-fns";

interface TimelineTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const TimelineTooltip = ({ active, payload, label }: TimelineTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Safely parse the date string
  let formattedDate = '';
  try {
    formattedDate = label ? format(parseISO(label), 'MMMM yyyy') : '';
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = label || '';
  }

  const currencySymbol = payload[0]?.payload?.currencySymbol || '£';
  const originalBalance = payload[0]?.value || 0;
  const acceleratedBalance = payload[1]?.value || 0;
  const oneTimePayment = payload[1]?.payload?.oneTimePayment;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-semibold mb-2">{formattedDate}</p>
      <div className="space-y-1">
        <p className="text-sm text-gray-600">
          Original Balance: {currencySymbol}{originalBalance.toLocaleString()}
        </p>
        <p className="text-sm text-emerald-600">
          Accelerated Balance: {currencySymbol}{acceleratedBalance.toLocaleString()}
        </p>
        {oneTimePayment && (
          <p className="text-sm text-purple-600">
            One-time Payment: {currencySymbol}{oneTimePayment.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};
