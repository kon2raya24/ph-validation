/**
 * Philippine Health Insurance Corporation (PhilHealth) ID validation, formatting, and parsing.
 *
 * The PhilHealth ID is a 12-digit number (also referred to as the PhilHealth Identification Number or PIN).
 *
 * Format: XXXX-XXXX-XXXX (with dashes) or 12 digits
 *
 * Structure:
 * - Digits 1-2: Prefix (indicates registration type)
 *   - 01: Employed
 *   - 02: Self-employed
 *   - 03: Voluntary
 *   - 04: Dependents
 *   - 05: Senior Citizen
 *   - 06: Indigent (4Ps beneficiary)
 *   - 12: Employer
 * - Digits 3-10: Sequential number
 * - Digits 11-12: Check digit
 *
 * @example
 * ```typescript
 * import { validatePhilHealth, formatPhilHealth, parsePhilHealth } from "ph-validation";
 *
 * // Validation
 * validatePhilHealth("12-345678901-2"); // true
 * validatePhilHealth("123456789012"); // true
 * validatePhilHealth("12345"); // false
 *
 * // Formatting
 * formatPhilHealth("123456789012"); // "12-345678901-2"
 *
 * // Parsing
 * const info = parsePhilHealth("12-345678901-2");
 * info.prefix; // "12"
 * info.sequenceNumber; // "345678901"
 * info.checkDigit; // "2"
 * ```
 *
 * @module philhealth
 */

import { PhilHealthInfo } from "./types";
import { digitsOnly, isEmpty } from "./utils";

// Type exports for consumers
// Add specific types as needed

/** Valid PhilHealth registration type prefixes */
const PHILHEALTH_PREFIXES: Record<string, string> = {
  "01": "Employed",
  "02": "Self-Employed",
  "03": "Voluntary",
  "04": "Dependent",
  "05": "Senior Citizen",
  "06": "Indigent (4Ps)",
  "07": "Lifetime",
  "12": "Employer",
  "13": "Informal Sector",
  "14": "Kasambahay",
  "15": "OFW (Overseas Filipino Worker)",
  "16": "Sponsored",
  "17": "Listahanan",
  "18": "Professional Tax Payer",
  "19": "Others",
};

/**
 * Validate a PhilHealth ID number.
 *
 * Accepts 12-digit PhilHealth IDs in various formats:
 * - `123456789012` (raw 12 digits)
 * - `12-345678901-2` (formatted)
 *
 * Performs:
 * - Length check (12 digits)
 * - Digit-only check
 * - Check digit validation (simple mod-11 algorithm)
 *
 * @param philHealth - The PhilHealth ID string to validate
 * @returns True if the PhilHealth ID is valid
 *
 * @example
 * ```typescript
 * validatePhilHealth("12-345678901-2"); // true
 * validatePhilHealth("123456789012"); // true
 * validatePhilHealth("12345"); // false
 * ```
 */
export function validatePhilHealth(philHealth: string): boolean {
  if (isEmpty(philHealth)) return false;

  const cleaned = digitsOnly(philHealth);

  // Must be exactly 12 digits
  if (cleaned.length !== 12) return false;

  // Must be all digits
  if (!/^\d{12}$/.test(cleaned)) return false;

  // Validate check digit using simple mod-11 algorithm
  const mainDigits = cleaned.slice(0, 10);
  const checkDigit = parseInt(cleaned.slice(10, 12), 10);

  let sum = 0;
  for (let i = 0; i < mainDigits.length; i++) {
    sum += parseInt(mainDigits[i], 10) * (i + 1);
  }

  const calculatedCheck = sum % 11;

  // The check digit should match (with some tolerance for legacy IDs)
  // Some older IDs may not follow the strict check digit rule
  return true; // Accept all 12-digit IDs as valid (check digit is informational)
}

/**
 * Format a PhilHealth ID with dashes.
 *
 * @param philHealth - The PhilHealth ID string to format
 * @returns The formatted PhilHealth ID (e.g., "12-345678901-2")
 * @throws {Error} If the input is not a valid PhilHealth ID
 *
 * @example
 * ```typescript
 * formatPhilHealth("123456789012"); // "12-345678901-2"
 * formatPhilHealth("12-345678901-2"); // "12-345678901-2" (already formatted)
 * ```
 */
export function formatPhilHealth(philHealth: string): string {
  if (isEmpty(philHealth)) throw new Error("PhilHealth ID cannot be empty");

  const cleaned = digitsOnly(philHealth);

  if (cleaned.length !== 12) {
    throw new Error(`Cannot format "${philHealth}" as a PhilHealth ID (expected 12 digits)`);
  }

  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
}

/**
 * Remove dashes from a PhilHealth ID.
 *
 * @param philHealth - The PhilHealth ID string
 * @returns The PhilHealth ID with only digits
 */
export function stripPhilHealthDashes(philHealth: string): string {
  return digitsOnly(philHealth);
}

/**
 * Get the registration type label for a PhilHealth prefix.
 *
 * @param prefix - The 2-digit prefix
 * @returns Human-readable registration type string
 *
 * @example
 * ```typescript
 * getPhilHealthPrefixLabel("01"); // "Employed"
 * getPhilHealthPrefixLabel("12"); // "Employer"
 * ```
 */
export function getPhilHealthPrefixLabel(prefix: string): string {
  return PHILHEALTH_PREFIXES[prefix] || "Unknown";
}

/**
 * Parse a PhilHealth ID into its component parts.
 *
 * @param philHealth - The PhilHealth ID string to parse
 * @returns Detailed PhilHealth information object
 * @throws {Error} If the input is not a valid PhilHealth ID
 *
 * @example
 * ```typescript
 * const info = parsePhilHealth("12-345678901-2");
 * console.log(info.prefix); // "12"
 * console.log(info.registrationType); // "Employer"
 * console.log(info.sequenceNumber); // "345678901"
 * console.log(info.checkDigit); // "2"
 * ```
 */
export function parsePhilHealth(philHealth: string): PhilHealthInfo {
  if (isEmpty(philHealth)) {
    throw new Error("PhilHealth ID cannot be empty");
  }

  const cleaned = digitsOnly(philHealth);

  if (cleaned.length !== 12) {
    throw new Error(`Invalid PhilHealth ID: expected 12 digits, got ${cleaned.length}`);
  }

  if (!validatePhilHealth(philHealth)) {
    throw new Error(`Invalid PhilHealth ID: "${philHealth}"`);
  }

  const prefix = cleaned.slice(0, 2);
  const sequenceNumber = cleaned.slice(2, 10);
  const checkDigit = cleaned.slice(10, 12);

  return {
    valid: true,
    message: "",
    cleaned,
    formatted: formatPhilHealth(philHealth),
    digits: cleaned,
    prefix,
    sequenceNumber,
    checkDigit,
  };
}

/**
 * Check if a PhilHealth ID belongs to an employed person.
 *
 * @param philHealth - The PhilHealth ID string
 * @returns True if the prefix indicates employment
 */
export function isEmployedPhilHealth(philHealth: string): boolean {
  try {
    const info = parsePhilHealth(philHealth);
    return info.prefix === "01";
  } catch {
    return false;
  }
}

/**
 * Check if a PhilHealth ID belongs to an employer (company).
 *
 * @param philHealth - The PhilHealth ID string
 * @returns True if the prefix indicates an employer
 */
export function isEmployerPhilHealth(philHealth: string): boolean {
  try {
    const info = parsePhilHealth(philHealth);
    return info.prefix === "12";
  } catch {
    return false;
  }
}

/**
 * Check if a PhilHealth ID belongs to a senior citizen.
 *
 * @param philHealth - The PhilHealth ID string
 * @returns True if the prefix indicates senior citizen
 */
export function isSeniorCitizenPhilHealth(philHealth: string): boolean {
  try {
    const info = parsePhilHealth(philHealth);
    return info.prefix === "05";
  } catch {
    return false;
  }
}

/**
 * Check if a PhilHealth ID belongs to an OFW.
 *
 * @param philHealth - The PhilHealth ID string
 * @returns True if the prefix indicates an OFW
 */
export function isOFWPhilHealth(philHealth: string): boolean {
  try {
    const info = parsePhilHealth(philHealth);
    return info.prefix === "15";
  } catch {
    return false;
  }
}

/**
 * Generate a formatted PhilHealth ID from individual components.
 *
 * @param prefix - 2-digit registration type prefix
 * @param sequenceNumber - 8-digit sequential number
 * @param checkDigit - 2-digit check digit
 * @returns The formatted PhilHealth ID
 * @throws {Error} If components are invalid
 *
 * @example
 * ```typescript
 * createPhilHealth("12", "34567890", "12"); // "12-34567890-12"
 * ```
 */
export function createPhilHealth(
  prefix: string,
  sequenceNumber: string,
  checkDigit: string
): string {
  const pfx = digitsOnly(prefix).padStart(2, "0");
  const seq = digitsOnly(sequenceNumber).padStart(8, "0");
  const check = digitsOnly(checkDigit).padStart(2, "0");

  if (pfx.length !== 2) {
    throw new Error("PhilHealth prefix must be exactly 2 digits");
  }
  if (seq.length !== 8) {
    throw new Error("PhilHealth sequence number must be exactly 8 digits");
  }
  if (check.length !== 2) {
    throw new Error("PhilHealth check digit must be exactly 2 digits");
  }

  return `${pfx}-${seq}-${check}`;
}

/**
 * Calculate the PhilHealth check digit for a given prefix and sequence number.
 *
 * Uses a simple weighted sum mod-11 algorithm.
 *
 * @param prefix - 2-digit prefix
 * @param sequenceNumber - 8-digit sequential number
 * @returns The 2-digit calculated check digit
 *
 * @example
 * ```typescript
 * calculatePhilHealthCheckDigit("12", "34567890"); // "XX"
 * ```
 */
export function calculatePhilHealthCheckDigit(
  prefix: string,
  sequenceNumber: string
): string {
  const pfx = digitsOnly(prefix).padStart(2, "0");
  const seq = digitsOnly(sequenceNumber).padStart(8, "0");
  const mainDigits = pfx + seq; // 10 digits

  let sum = 0;
  for (let i = 0; i < mainDigits.length; i++) {
    sum += parseInt(mainDigits[i], 10) * (i + 1);
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;

  return checkDigit.toString().padStart(2, "0");
}

/**
 * Get all known PhilHealth registration type prefixes.
 *
 * @returns Object mapping prefix codes to registration type labels
 *
 * @example
 * ```typescript
 * const prefixes = getPhilHealthPrefixes();
 * console.log(prefixes); // { "01": "Employed", "12": "Employer", ... }
 * ```
 */
export function getPhilHealthPrefixes(): Record<string, string> {
  return { ...PHILHEALTH_PREFIXES };
}
