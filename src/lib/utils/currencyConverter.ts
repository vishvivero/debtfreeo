
// A utility for handling currency conversions with annual exchange rates

// Exchange rates for 2025 (using current rates as placeholders)
// Base currency is USD
export const exchangeRates2025 = {
  "$": 1.00,      // USD (base)
  "£": 0.78,      // GBP
  "€": 0.92,      // EUR
  "JP¥": 150.51,  // JPY
  "A$": 1.52,     // AUD
  "C$": 1.36,     // CAD
  "Fr": 0.89,     // CHF
  "¥": 7.15,      // CNY
  "₹": 83.10,     // INR
  "R$": 5.45,     // BRL
  "₩": 1350.25,   // KRW
  "₽": 91.50,     // RUB
  "R": 18.70,     // ZAR
  "S$": 1.35,     // SGD
};

// Date of the last exchange rate update - display this to users
const lastUpdateDate = "2025-01-15";

/**
 * Get the date when exchange rates were last updated
 */
export const getExchangeRateUpdateDate = (): string => {
  return lastUpdateDate;
};

/**
 * Convert an amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The source currency symbol
 * @param toCurrency The target currency symbol
 * @returns The converted amount
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  // For debugging
  console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);
  
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get exchange rates relative to USD
  const fromRate = exchangeRates2025[fromCurrency] || 1;
  const toRate = exchangeRates2025[toCurrency] || 1;

  // Convert: first to USD, then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  console.log(`Conversion result: ${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency} (via USD)`);
  console.log(`Used exchange rates: 1 USD = ${fromRate} ${fromCurrency}, 1 USD = ${toRate} ${toCurrency}`);
  
  return Number(convertedAmount.toFixed(2));
};

/**
 * Format an amount with the appropriate currency symbol
 */
export const formatCurrency = (
  amount: number,
  currencySymbol: string = "$"
): string => {
  // Check for NaN or invalid values
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.warn(`Attempted to format invalid currency amount: ${amount}`);
    amount = 0;
  }

  // Format with appropriate number of decimal places
  return `${currencySymbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Convert multiple values at once using the same currency pair
 * This is more efficient than calling convertCurrency multiple times
 */
export const batchConvertCurrency = (
  amounts: number[],
  fromCurrency: string,
  toCurrency: string
): number[] => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amounts;
  }

  // Get exchange rates
  const fromRate = exchangeRates2025[fromCurrency] || 1;
  const toRate = exchangeRates2025[toCurrency] || 1;
  
  // Convert all amounts
  return amounts.map(amount => {
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;
    return Number(convertedAmount.toFixed(2));
  });
};
