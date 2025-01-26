import { jsPDF } from 'jspdf';
import { Debt } from '@/lib/types';
import { formatDate } from './formatters';
import { 
  generateDebtSummaryTable, 
  generatePaymentDetailsTable,
  generateSavingsTable,
  generateNextStepsTable
} from './tableGenerators';
import { Strategy } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';

export const generateDebtOverviewPDF = (
  debts: Debt[],
  monthlyPayment: number,
  extraPayment: number,
  baseMonths: number,
  optimizedMonths: number,
  baseTotalInterest: number,
  optimizedTotalInterest: number,
  selectedStrategy: Strategy,
  oneTimeFundings: OneTimeFunding[],
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

  // Add title and header
  doc.setFontSize(24);
  doc.setTextColor(0, 211, 130);
  doc.text('Your Debt Freedom Plan', 14, currentY);
  
  currentY += 10;
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${formatDate(new Date())}`, 14, currentY);
  
  currentY += 8;
  doc.text(`Strategy: ${selectedStrategy.name}`, 14, currentY);
  
  // Add debt summary section
  currentY += 15;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Current Debt Overview', 14, currentY);
  currentY += 10;
  currentY = generateDebtSummaryTable(doc, debts, currentY);

  // Add payment details section
  currentY += 15;
  doc.setFontSize(16);
  doc.text('Payment Strategy', 14, currentY);
  currentY += 10;
  currentY = generatePaymentDetailsTable(doc, debts, currentY, monthlyPayment, extraPayment, currencySymbol);

  // Add savings summary
  currentY += 15;
  doc.setFontSize(16);
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
  doc.setFontSize(16);
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
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  const tips = [
    "💡 Set up automatic payments to stay on track",
    "📊 Review your progress monthly",
    "🎯 Consider adding any windfalls as lump sum payments",
    "📱 Use our app to track your progress"
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