
import { useProfile } from "./use-profile";
import { convertCurrency, formatCurrency as formatCurrencyUtil } from "@/lib/utils/currencyConverter";
import { useMemo } from "react";

/**
 * Hook for handling currency conversions throughout the app
 */
export function useCurrency() {
  const { profile } = useProfile();
  
  // Get the user's preferred currency or use default
  const preferredCurrency = profile?.preferred_currency || "$";
  
  /**
   * Convert a value from one currency to the user's preferred currency
   */
  const convertToPreferredCurrency = (
    amount: number,
    fromCurrency: string
  ): number => {
    // If amount is invalid or currencies are the same, return amount
    if (!amount || isNaN(amount) || fromCurrency === preferredCurrency) {
      return amount;
    }
    
    console.log(`Converting ${fromCurrency}${amount} to ${preferredCurrency}`);
    return convertCurrency(amount, fromCurrency, preferredCurrency);
  };
  
  /**
   * Format a monetary value with the appropriate currency symbol
   */
  const formatCurrency = (
    amount: number,
    originalCurrency?: string,
    useOriginalCurrency = false
  ): string => {
    if (!amount || isNaN(amount)) return `${preferredCurrency}0`;
    
    const currencyToUse = useOriginalCurrency ? originalCurrency || preferredCurrency : preferredCurrency;
    const valueToUse = useOriginalCurrency 
      ? amount 
      : originalCurrency ? convertToPreferredCurrency(amount, originalCurrency) : amount;
    
    return formatCurrencyUtil(valueToUse, currencyToUse);
  };
  
  /**
   * Get display info for a monetary value, including both original and converted values
   */
  const getCurrencyDisplayInfo = (
    amount: number,
    originalCurrency: string
  ) => {
    const isOriginalCurrency = originalCurrency === preferredCurrency;
    const convertedAmount = isOriginalCurrency 
      ? amount 
      : convertToPreferredCurrency(amount, originalCurrency);
    
    return {
      originalAmount: amount,
      originalCurrency,
      originalFormatted: `${originalCurrency}${amount.toLocaleString()}`,
      convertedAmount,
      preferredCurrency,
      convertedFormatted: `${preferredCurrency}${convertedAmount.toLocaleString()}`,
      isOriginalCurrency
    };
  };
  
  return {
    preferredCurrency,
    convertToPreferredCurrency,
    formatCurrency,
    getCurrencyDisplayInfo
  };
}
