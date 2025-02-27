
import { formatDate } from "@/lib/utils/dateUtils";
import { parseISO } from "date-fns";

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
    const paymentDetails = payload[0]?.payload?.paymentDetails;
    const pointType = getPointType(payload[0]?.payload);
    
    return (
      <div className={`bg-white p-3 shadow-md rounded-md border border-gray-200 max-w-[280px] ${
        oneTimePayment ? 'border-l-4 border-l-purple-500' : ''
      }`}>
        <div className="flex justify-between items-center mb-1">
          <p className="font-medium text-gray-700">{date}</p>
          {pointType && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${getPointTypeStyles(pointType)}`}>
              {pointType}
            </span>
          )}
        </div>
        
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
              {currencySymbol}{Math.max(0, baselineBalance - acceleratedBalance).toLocaleString()}
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

function getPointType(dataPoint: any): string | null {
  if (!dataPoint) return null;
  
  if (dataPoint.oneTimePayment) {
    return 'One-Time Payment';
  }
  
  if (dataPoint.paymentDetails?.isPrefundingPoint) {
    return 'Before Funding';
  }
  
  if (dataPoint.paymentDetails?.isPostfundingPoint) {
    return 'After Funding';
  }
  
  return null;
}

function getPointTypeStyles(pointType: string): string {
  switch (pointType) {
    case 'One-Time Payment':
      return 'bg-purple-100 text-purple-800';
    case 'Before Funding':
      return 'bg-yellow-100 text-yellow-800';
    case 'After Funding':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
