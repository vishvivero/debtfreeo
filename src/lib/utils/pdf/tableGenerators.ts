
import { jsPDF } from 'jspdf';
import { Debt } from '@/lib/types';
import { formatCurrency, formatDate, formatPercentage, formatMonths } from './formatters';
import { OneTimeFunding } from '@/lib/types/payment';
import autoTable from 'jspdf-autotable';

export const generateDebtSummaryTable = (doc: jsPDF, debts: Debt[], startY: number) => {
  const tableData = debts.map(debt => [
    debt.name,
    debt.banker_name,
    formatCurrency(debt.balance, debt.currency_symbol),
    formatPercentage(debt.interest_rate),
    formatCurrency(debt.minimum_payment, debt.currency_symbol)
  ]);

  autoTable(doc, {
    startY,
    head: [['Debt Name', 'Lender', 'Balance', 'Interest Rate', 'Min Payment']],
    body: tableData,
    theme: 'grid',
    styles: { 
      fontSize: 10,
      cellPadding: 6,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    headStyles: { 
      fillColor: [0, 211, 130],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  return (doc as any).lastAutoTable.finalY;
};

export const generatePaymentDetailsTable = (
  doc: jsPDF,
  monthlyPayment: number,
  extraPayment: number,
  startY: number,
  currencySymbol: string
) => {
  const tableData = [
    ['Regular Monthly Payment', formatCurrency(monthlyPayment - extraPayment, currencySymbol)],
    ['Extra Payment', formatCurrency(extraPayment, currencySymbol)],
    ['Total Monthly Commitment', formatCurrency(monthlyPayment, currencySymbol)]
  ];

  autoTable(doc, {
    startY,
    body: tableData,
    theme: 'plain',
    styles: { 
      fontSize: 11,
      cellPadding: 4, // Reduced from 8 to 4
      lineHeight: 1.2, // Added to reduce vertical spacing
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 80 }
    }
  });

  return (doc as any).lastAutoTable.finalY;
};

export const generateSavingsTable = (
  doc: jsPDF,
  baseMonths: number,
  optimizedMonths: number,
  baseTotalInterest: number,
  optimizedTotalInterest: number,
  startY: number,
  currencySymbol: string
) => {
  const monthsSaved = Math.max(0, baseMonths - optimizedMonths);
  const interestSaved = Math.max(0, baseTotalInterest - optimizedTotalInterest);
  
  const tableData = [
    ['Time Saved', formatMonths(monthsSaved)],
    ['Interest Savings', formatCurrency(interestSaved, currencySymbol)],
    ['New Payoff Timeline', formatMonths(optimizedMonths)],
    ['Interest Reduction', formatPercentage((interestSaved / baseTotalInterest) * 100)]
  ];

  autoTable(doc, {
    startY,
    body: tableData,
    theme: 'striped',
    styles: { 
      fontSize: 11,
      cellPadding: 6,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 80, textColor: [0, 211, 130] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  return (doc as any).lastAutoTable.finalY;
};

export const generateNextStepsTable = (
  doc: jsPDF,
  monthlyPayment: number,
  extraPayment: number,
  oneTimeFundings: OneTimeFunding[],
  startY: number,
  currencySymbol: string
) => {
  const actions = [
    [`Set up your monthly payment of ${formatCurrency(monthlyPayment, currencySymbol)}`, 'Immediate'],
    [`Allocate extra payment of ${formatCurrency(extraPayment, currencySymbol)}`, 'Monthly'],
  ];

  oneTimeFundings.forEach(funding => {
    actions.push([
      `Add lump sum payment of ${formatCurrency(funding.amount, currencySymbol)}`,
      formatDate(new Date(funding.payment_date))
    ]);
  });

  autoTable(doc, {
    startY,
    head: [['Action Item', 'Timeline']],
    body: actions,
    theme: 'grid',
    styles: { 
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [147, 51, 234],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  return (doc as any).lastAutoTable.finalY;
};
