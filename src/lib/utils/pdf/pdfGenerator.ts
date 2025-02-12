
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
import { formatDate, formatCurrency, formatPercentage } from './formatters';

const BRAND_COLOR = [0, 211, 130]; // Green
const ACCENT_COLOR = [147, 51, 234]; // Purple
const TEXT_COLOR = [31, 41, 55]; // Gray-800

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
  let currentY = 0;

  // Helper function to add colored rectangle
  const addColoredRect = (y: number, height: number, color: number[]) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(0, y, doc.internal.pageSize.width, height, 'F');
  };

  // Add header banner
  addColoredRect(0, 40, BRAND_COLOR);
  
  // Add title and date
  currentY = 25;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Debt Freedom Journey', 20, currentY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report generated on ${formatDate(new Date())}`, 20, currentY + 8);

  // Add executive summary
  currentY = 50;
  doc.setTextColor(...TEXT_COLOR);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, currentY);

  // Summary boxes
  currentY += 10;
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const boxes = [
    { label: 'Total Debt', value: formatCurrency(totalDebt, currencySymbol) },
    { label: 'Monthly Payment', value: formatCurrency(monthlyPayment, currencySymbol) },
    { label: 'Time to Freedom', value: `${optimizedMonths} months` },
    { label: 'Interest Savings', value: formatCurrency(baseTotalInterest - optimizedTotalInterest, currencySymbol) }
  ];

  boxes.forEach((box, index) => {
    const x = 20 + (index % 2) * 85;
    const y = currentY + Math.floor(index / 2) * 25;
    
    // Add box background
    doc.setFillColor(248, 250, 252); // Gray-50
    doc.roundedRect(x, y, 75, 20, 3, 3, 'F');
    
    // Add text
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_COLOR);
    doc.text(box.label, x + 5, y + 7);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(box.value, x + 5, y + 16);
  });

  // Progress section
  currentY += 60;
  addColoredRect(currentY, 3, ACCENT_COLOR);
  currentY += 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Progress Overview', 20, currentY);
  
  // Add debt breakdown table
  currentY += 10;
  currentY = generateDebtSummaryTable(doc, debts, currentY) + 20;

  // Strategy section
  doc.addPage();
  currentY = 20;
  
  // Strategy header
  addColoredRect(currentY - 10, 3, BRAND_COLOR);
  doc.setFontSize(14);
  doc.text('Payment Strategy & Timeline', 20, currentY);
  
  // Strategy details
  currentY += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Using ${strategy.name} strategy to accelerate your debt freedom`, 20, currentY);
  
  // Payment breakdown
  currentY += 10;
  currentY = generatePaymentDetailsTable(doc, monthlyPayment, extraPayment, currentY, currencySymbol) + 20;

  // Savings projection
  currentY = generateSavingsTable(
    doc,
    baseMonths,
    optimizedMonths,
    baseTotalInterest,
    optimizedTotalInterest,
    currentY,
    currencySymbol
  ) + 20;

  // Action items page
  doc.addPage();
  currentY = 20;
  
  // Action items header
  addColoredRect(currentY - 10, 3, ACCENT_COLOR);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Next Steps', 20, currentY);
  
  // Next steps and recommendations
  currentY += 15;
  currentY = generateNextStepsTable(
    doc,
    monthlyPayment,
    extraPayment,
    oneTimeFundings,
    currentY,
    currencySymbol
  );

  // Add tips section
  currentY += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Pro Tips for Success:', 20, currentY);
  
  const tips = [
    '✓ Set up automatic payments to never miss a due date',
    '✓ Apply any extra funds to your highest interest debt first',
    '✓ Track your progress monthly and celebrate milestones',
    '✓ Consider consolidating high-interest debts if possible'
  ];

  tips.forEach((tip, index) => {
    currentY += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(tip, 25, currentY);
  });

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add footer line
    addColoredRect(doc.internal.pageSize.height - 20, 0.5, [229, 231, 235]);
    
    // Add page number and website
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
};
