
export interface CountryCurrency {
  country: string;
  currency: string;
  code: string;
  symbol: string;
}

export const countryCurrencies: CountryCurrency[] = [
  { country: "United States", currency: "US Dollar", code: "USD", symbol: "$" },
  { country: "United Kingdom", currency: "British Pound", code: "GBP", symbol: "£" },
  { country: "European Union", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Japan", currency: "Japanese Yen", code: "JPY", symbol: "¥" },
  { country: "Australia", currency: "Australian Dollar", code: "AUD", symbol: "A$" },
  { country: "Canada", currency: "Canadian Dollar", code: "CAD", symbol: "C$" },
  { country: "Switzerland", currency: "Swiss Franc", code: "CHF", symbol: "Fr" },
  { country: "China", currency: "Chinese Yuan", code: "CNY", symbol: "¥" },
  { country: "India", currency: "Indian Rupee", code: "INR", symbol: "₹" },
  { country: "Brazil", currency: "Brazilian Real", code: "BRL", symbol: "R$" },
  { country: "South Korea", currency: "South Korean Won", code: "KRW", symbol: "₩" },
  { country: "Russia", currency: "Russian Ruble", code: "RUB", symbol: "₽" },
  { country: "South Africa", currency: "South African Rand", code: "ZAR", symbol: "R" },
  { country: "Singapore", currency: "Singapore Dollar", code: "SGD", symbol: "S$" },
];
