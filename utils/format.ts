import Decimal from 'break_infinity.js';

export const formatNumber = (num: number | string | Decimal): string => {
  const decimal = new Decimal(num);
  
  // If the number is less than 10,000, show regular number with commas
  if (decimal.lt(10000)) {
    return Math.floor(decimal.toNumber()).toLocaleString();
  }

  // Otherwise, use scientific notation (e.g., 1.23e5)
  // We remove the '+' sign that often comes with standard toExponential
  return decimal.toExponential(2).replace('+', '');
};

// Helper to ensure we are working with Decimals in calculations if needed later
export const toDecimal = (num: number | string): Decimal => {
    return new Decimal(num);
}