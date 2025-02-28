
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
  // Log the conversion request for debugging
  console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);
  
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    console.log(`No conversion needed, currencies are the same: ${fromCurrency}`);
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

  // Handle potentially large numbers with appropriate formatting
  if (amount >= 1000000) {
    const millions = (amount / 1000000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${currencySymbol}${millions}M`;
  } else if (amount >= 1000) {
    const thousands = (amount / 1000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    return `${currencySymbol}${thousands}K`;
  } else {
    return `${currencySymbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
};

/**
 * Get the last update date for exchange rates
 */
export const getExchangeRateUpdateDate = (): string => {
  // Currently using placeholder rates
  return "January 1, 2025";
};
