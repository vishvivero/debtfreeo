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
    formatCurrency(debt.minimum_payment, debt.currency_symbol),
    debt.next_payment_date ? formatDate(new Date(debt.next_payment_date)) : 'N/A'
  ]);

  autoTable(doc, {
    startY,
    head: [['Debt Name', 'Lender', 'Balance', 'Interest Rate', 'Min Payment', 'Next Payment']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 211, 130], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
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
    ['📅 Monthly Payment', formatCurrency(monthlyPayment - extraPayment, currencySymbol)],
    ['⭐ Extra Payment', formatCurrency(extraPayment, currencySymbol)],
    ['💰 Total Monthly', formatCurrency(monthlyPayment, currencySymbol)]
  ];

  autoTable(doc, {
    startY,
    body: tableData,
    theme: 'plain',
    styles: { 
      fontSize: 12,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' }
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
    ['⏱️ Time Saved', formatMonths(monthsSaved)],
    ['💵 Interest Saved', formatCurrency(interestSaved, currencySymbol)],
    ['🎯 New Payoff Timeline', formatMonths(optimizedMonths)],
    ['📊 Interest Reduction', formatPercentage((interestSaved / baseTotalInterest) * 100)]
  ];

  autoTable(doc, {
    startY,
    body: tableData,
    theme: 'grid',
    styles: { 
      fontSize: 12,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold', textColor: [0, 211, 130] }
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
  const tableData = [
    ['📅 Monthly Payment Schedule'],
    ['Regular Payment', formatCurrency(monthlyPayment - extraPayment, currencySymbol)],
    ['Extra Payment', formatCurrency(extraPayment, currencySymbol)],
    ['Total Monthly', formatCurrency(monthlyPayment, currencySymbol)],
    [''],
    ['💰 Upcoming Lump Sum Payments']
  ];

  oneTimeFundings.forEach(funding => {
    tableData.push([
      `${formatDate(new Date(funding.payment_date))} - ${formatCurrency(funding.amount, currencySymbol)}`
    ]);
  });

  autoTable(doc, {
    startY,
    body: tableData,
    theme: 'plain',
    styles: { 
      fontSize: 12,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });

  return (doc as any).lastAutoTable.finalY;
};