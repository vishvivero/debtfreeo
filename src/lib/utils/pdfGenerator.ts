
import { jsPDF } from 'jspdf';
import { Debt } from '@/lib/types';
import { formatDate } from './pdf/formatters';
import { 
  generateDebtSummaryTable, 
  generatePaymentDetailsTable,
  generateSavingsTable,
  generateNextStepsTable
} from './pdf/tableGenerators';
import { Strategy } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';

export const generateDebtOverviewPDF = (
  debts: Debt[],
  monthlyPayment: number = 0,
  extraPayment: number = 0,
  baseMonths: number = 0,
  optimizedMonths: number = 0,
  baseTotalInterest: number = 0,
  optimizedTotalInterest: number = 0,
  selectedStrategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = [],
  currencySymbol: string = '£'
) => {
  console.log('Generating enhanced PDF report with:', {
    numberOfDebts: debts.length,
    monthlyPayment,
    extraPayment,
    strategy: selectedStrategy.name,
    oneTimeFundings: oneTimeFundings.length
  });

  const doc = new jsPDF();
  let currentY = 20;

  // Set consistent text styling
  const textColor = [128, 128, 128] as [number, number, number];  // Gray color for all text
  const titleFontSize = 16;
  const bodyFontSize = 12;

  // Add title and header
  doc.setFontSize(titleFontSize);
  doc.setTextColor(...textColor);
  doc.text('Your Debt Freedom Plan', 14, currentY);
  
  currentY += 10;
  doc.setFontSize(bodyFontSize);
  doc.text(`Generated on ${formatDate(new Date())}`, 14, currentY);
  
  currentY += 8;
  doc.text(`Strategy: ${selectedStrategy.name}`, 14, currentY);
  
  // Add debt summary section
  currentY += 15;
  doc.setFontSize(titleFontSize);
  doc.text('Current Debt Overview', 14, currentY);
  currentY += 10;
  currentY = generateDebtSummaryTable(doc, debts, currentY);

  // Add payment details section
  currentY += 15;
  doc.setFontSize(titleFontSize);
  doc.text('Payment Strategy', 14, currentY);
  currentY += 10;
  currentY = generatePaymentDetailsTable(doc, monthlyPayment, extraPayment, currentY, currencySymbol);

  // Add savings summary
  currentY += 15;
  doc.setFontSize(titleFontSize);
  doc.text('Your Savings', 14, currentY);
  currentY += 10;
  currentY = generateSavingsTable(
    doc,
    baseMonths,
    optimizedMonths,
    baseTotalInterest,
    optimizedTotalInterest,
    currentY,
    currencySymbol
  );

  // Add next steps section
  doc.addPage();
  currentY = 20;
  doc.setFontSize(titleFontSize);
  doc.text('Next Steps', 14, currentY);
  currentY += 10;
  currentY = generateNextStepsTable(
    doc,
    monthlyPayment,
    extraPayment,
    oneTimeFundings,
    currentY,
    currencySymbol
  );

  // Add footer with tips
  doc.setFontSize(bodyFontSize);
  doc.setTextColor(...textColor);
  const tips = [
    "• Set up automatic payments to stay on track",
    "• Review your progress monthly",
    "• Consider adding any windfalls as lump sum payments",
    "• Use our app to track your progress"
  ];
  
  currentY += 20;
  doc.text('Tips for Success:', 14, currentY);
  currentY += 10;
  tips.forEach(tip => {
    doc.text(tip, 14, currentY);
    currentY += 8;
  });

  return doc;
};

// For backward compatibility
export const generatePayoffStrategyPDF = generateDebtOverviewPDF;
export const generateAmortizationPDF = generateDebtOverviewPDF;
export const generatePaymentTrendsPDF = generateDebtOverviewPDF;
