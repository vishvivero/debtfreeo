
import { format, parseISO, isValid, isSameMonth, isSameYear } from "date-fns";

/**
 * Normalizes various date inputs to ISO strings
 * @param dateInput Date input in various formats
 * @returns Normalized ISO string or null if invalid
 */
export const normalizeDate = (dateInput: Date | string | number | undefined | null): string | null => {
  if (!dateInput) return null;
  
  try {
    // Handle string dates
    if (typeof dateInput === 'string') {
      const parsedDate = parseISO(dateInput);
      if (isValid(parsedDate)) {
        return parsedDate.toISOString();
      }
      return null;
    }
    
    // Handle number timestamps
    if (typeof dateInput === 'number') {
      const dateFromTimestamp = new Date(dateInput);
      if (isValid(dateFromTimestamp)) {
        return dateFromTimestamp.toISOString();
      }
      return null;
    }
    
    // Handle Date objects
    if (dateInput instanceof Date && isValid(dateInput)) {
      return dateInput.toISOString();
    }
    
    return null;
  } catch (error) {
    console.error('Error normalizing date:', error);
    return null;
  }
};

/**
 * Formats a date for display
 * @param dateInput Date input in various formats
 * @param formatString Format string for date-fns format function
 * @returns Formatted date string or fallback if invalid
 */
export const formatDate = (
  dateInput: Date | string | number | undefined | null,
  formatString: string = 'MMM yyyy',
  fallback: string = '-'
): string => {
  const normalized = normalizeDate(dateInput);
  if (!normalized) return fallback;
  
  try {
    return format(parseISO(normalized), formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Checks if two dates are in the same month and year
 */
export const isSameMonthAndYear = (date1: Date | string | null, date2: Date | string | null): boolean => {
  if (!date1 || !date2) return false;
  
  try {
    const normalized1 = normalizeDate(date1);
    const normalized2 = normalizeDate(date2);
    
    if (!normalized1 || !normalized2) return false;
    
    const parsed1 = parseISO(normalized1);
    const parsed2 = parseISO(normalized2);
    
    return isSameMonth(parsed1, parsed2) && isSameYear(parsed1, parsed2);
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};

/**
 * Creates a date for the beginning of a month
 */
export const getMonthStart = (date: Date | string): Date => {
  const normalized = normalizeDate(date);
  if (!normalized) return new Date();
  
  const parsedDate = parseISO(normalized);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
};
