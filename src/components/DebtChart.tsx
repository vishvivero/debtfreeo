import { Debt } from "@/lib/types";
import { motion } from "framer-motion";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { ChartContainer } from "./debt/chart/ChartContainer";
import { calculateChartDomain } from "./debt/chart/chartCalculations";
import { strategies } from "@/lib/strategies";
import { useProfile } from "@/hooks/use-profile";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { generateChartData } from "./debt/chart/chartUtils";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from 'react';

const LazyChartContainer = lazy(() => import('./debt/chart/ChartContainer').then(module => ({
  default: module.ChartContainer
})));

interface DebtChartProps {
  debts: Debt[];
  monthlyPayment: number;
  currencySymbol?: string;
  oneTimeFundings?: OneTimeFunding[];
}

export const DebtChart = ({ 
  debts, 
  monthlyPayment, 
  currencySymbol = '£',
  oneTimeFundings = []
}: DebtChartProps) => {
  const { profile } = useProfile();
  
  if (!debts?.length || !profile) {
    console.log('No debts or profile available:', { debtCount: debts?.length, hasProfile: !!profile });
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No debt data available to display</p>
      </div>
    );
  }

  const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];

  console.log('Starting DebtChart calculation with:', {
    debts: debts.map(d => ({ name: d.name, balance: d.balance })),
    monthlyPayment,
    strategy: selectedStrategy.name,
    oneTimeFundings: oneTimeFundings.map(f => ({ 
      date: f.payment_date, 
      amount: f.amount 
    }))
  });

  try {
    const chartData = generateChartData(debts, monthlyPayment, oneTimeFundings);
    
    if (!chartData || chartData.length === 0) {
      console.log('No chart data generated');
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Unable to generate chart data</p>
        </div>
      );
    }

    const { maxDebt } = calculateChartDomain(chartData);

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <LazyChartContainer 
          data={chartData}
          maxDebt={maxDebt}
          currencySymbol={currencySymbol}
          oneTimeFundings={oneTimeFundings}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error calculating debt chart data:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Error calculating debt chart data</p>
      </div>
    );
  }
};