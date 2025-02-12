
import { jsPDF } from 'jspdf';
import { Debt } from '@/lib/types';
import { Strategy } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';
import {
  generateDebtSummaryTable,
  generatePaymentDetailsTable,
  generateSavingsTable,
  generateNextStepsTable
} from './tableGenerators';
import { formatDate } from './formatters';

export const generateDebtOverviewPDF = (
  debts: Debt[],
  monthlyPayment: number,
  extraPayment: number,
  baseMonths: number,
  optimizedMonths: number,
  baseTotalInterest: number,
  optimizedTotalInterest: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[],
  currencySymbol: string
): jsPDF => {
  const doc = new jsPDF();
  let currentY = 20;

  // Add header with logo and date
  doc.setFontSize(24);
  doc.setTextColor(0, 211, 130);
  doc.text('Debt Overview Report', 20, currentY);
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${formatDate(new Date())}`, 20, currentY + 8);
  
  currentY += 25;

  // Add summary section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Your Debt Summary', 20, currentY);
  currentY += 10;

  // Generate debt summary table
  currentY = generateDebtSummaryTable(doc, debts, currentY) + 15;

  // Add payment strategy section
  doc.setFontSize(16);
  doc.text('Payment Strategy', 20, currentY);
  currentY += 10;

  doc.setFontSize(12);
  doc.setTextColor(89, 89, 89);
  doc.text(`Using ${strategy.name} strategy`, 20, currentY);
  currentY += 15;

  // Generate payment details table
  currentY = generatePaymentDetailsTable(doc, monthlyPayment, extraPayment, currentY, currencySymbol) + 15;

  // Check if we need a new page
  if (currentY > doc.internal.pageSize.height - 60) {
    doc.addPage();
    currentY = 20;
  }

  // Add savings section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Projected Savings', 20, currentY);
  currentY += 10;

  // Generate savings table
  currentY = generateSavingsTable(
    doc,
    baseMonths,
    optimizedMonths,
    baseTotalInterest,
    optimizedTotalInterest,
    currentY,
    currencySymbol
  ) + 15;

  // Check if we need a new page
  if (currentY > doc.internal.pageSize.height - 60) {
    doc.addPage();
    currentY = 20;
  }

  // Add next steps section
  doc.setFontSize(16);
  doc.text('Next Steps', 20, currentY);
  currentY += 10;

  // Generate next steps table
  currentY = generateNextStepsTable(
    doc,
    monthlyPayment,
    extraPayment,
    oneTimeFundings,
    currentY,
    currencySymbol
  );

  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
};
