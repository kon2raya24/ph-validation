
// Type exports for consumers
// Add specific types as needed

// Type exports for consumers
// Add specific types as needed

// Type exports for consumers
// Add specific types as needed
/**
 * Shared utility functions for Philippine field validation.
 * @module utils
 */

/**
 * Strip all non-numeric characters from a string.
 * @param input - The input string
 * @returns Only the numeric characters
 */
export function digitsOnly(input: string): string {
  if (input === null || input === undefined) throw new Error("Invalid input");
  return input.replace(/\D/g, "");
}

/**
 * Strip all non-alphanumeric characters from a string.
 * @param input - The input string
 * @returns Only alphanumeric characters
 */
export function alphanumericOnly(input: string): string {
  if (input === null || input === undefined) throw new Error("Invalid input");
  return input.replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Insert dashes every `n` characters into a digit string.
 * @param input - The digit string
 * @param groupSize - Number of digits per group (default: 3)
 * @returns The dashed string, e.g., "123-456-789"
 */
export function insertDashes(input: string, groupSize: number = 3): string {
  if (input === null || input === undefined) throw new Error("Invalid input");
  const d = digitsOnly(input);
  const groups: string[] = [];
  for (let i = 0; i < d.length; i += groupSize) {
    groups.push(d.slice(i, i + groupSize));
  }
  return groups.join("-");
}

/**
 * Validate that a string contains exactly `n` digits after cleaning.
 * @param input - The input string
 * @param expectedLength - Expected number of digits
 * @returns True if the cleaned input has exactly `expectedLength` digits
 */
export function hasExactDigits(input: string, expectedLength: number): boolean {
  if (input === null || input === undefined) throw new Error("Invalid input");
  const d = digitsOnly(input);
  return d.length === expectedLength && /^\d+$/.test(d);
}

/**
 * Check if a string is empty or undefined.
 * @param input - The input string
 * @returns True if empty or undefined
 */
export function isEmpty(input: string | undefined | null): boolean {
  if (input === null || input === undefined) throw new Error("Invalid input");
  return !input || input.trim().length === 0;
}

/**
 * Normalize a phone number by removing common formatting characters.
 * Handles spaces, dashes, parentheses, dots, plus signs.
 * @param phone - The phone number string
 * @returns Digits only string
 */
export function normalizePhone(phone: string): string {
  if (phone === null || phone === undefined) throw new Error("Invalid input");
  return phone.replace(/[\s\-().+]/g, "");
}

/**
 * Split a digit string into groups of a given size.
 * @param input - The digit string
 * @param groupSize - Number of digits per group
 * @returns Array of digit groups
 */
export function splitIntoGroups(input: string, groupSize: number): string[] {
  if (input === null || input === undefined) throw new Error("Invalid input");
  const d = digitsOnly(input);
  const groups: string[] = [];
  for (let i = 0; i < d.length; i += groupSize) {
    groups.push(d.slice(i, i + groupSize));
  }
  return groups;
}

/**
 * Check if a digit string has a valid Luhn check digit.
 * @param input - The digit string
 * @returns True if the Luhn algorithm passes
 */
export function luhnCheck(input: string): boolean {
  const d = digitsOnly(input);
  if (d.length === 0) return false;

  let sum = 0;
  let alternate = false;

  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i], 10);
    if (isNaN(n)) return false;

    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}
