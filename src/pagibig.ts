/**
 * Pag-IBIG Fund (Home Development Mutual Fund - HDMF) MID validation, formatting, and parsing.
 *
 * The Pag-IBIG MID (Membership ID) is a 12-digit number issued by the Pag-IBIG Fund.
 *
 * Format: XXXX-XXXX-XXXX (with dashes) or 12 digits
 *
 * Structure:
 * - Digits 1-2: Registration type
 *   - 10: Local employee
 *   - 11: OFW (Overseas Filipino Worker)
 *   - 12: Employer
 *   - 13: Voluntary
 *   - 14: Self-employed
 *   - 15: Kasambahay
 *   - 20: Regular member
 * - Digits 3-10: Sequential number
 * - Digits 11-12: Check digit
 *
 * @example
 * ```typescript
 * import { validatePagIBIG, formatPagIBIG, parsePagIBIG } from "ph-validation";
 *
 * // Validation
 * validatePagIBIG("12-345678901-2"); // true
 * validatePagIBIG("123456789012"); // true
 * validatePagIBIG("12345"); // false
 *
 * // Formatting
 * formatPagIBIG("123456789012"); // "12-345678901-2"
 *
 * // Parsing
 * const info = parsePagIBIG("12-345678901-2");
 * info.prefix; // "12"
 * info.registrationType; // "Employer"
 * ```
 *
 * @module pagibig
 */

import { PagIBIGInfo } from "./types";
import { digitsOnly, isEmpty } from "./utils";

// Type exports for consumers
// Add specific types as needed

// Type exports for consumers
// Add specific types as needed

// Type exports for consumers
// Add specific types as needed

/** Valid Pag-IBIG registration type prefixes */
const PAGIBIG_PREFIXES: Record<string, string> = {
  "10": "Local Employee",
  "11": "OFW (Overseas Filipino Worker)",
  "12": "Employer",
  "13": "Voluntary",
  "14": "Self-Employed",
  "15": "Kasambahay",
  "16": "Migrant Worker",
  "17": "Military/Uniformed Personnel",
  "18": "Government Employee",
  "20": "Regular Member",
  "21": "Pensioner",
  "22": "Retiree",
  "23": "Lifetime Member",
  "24": "Others",
};

/**
 * Validate a Pag-IBIG MID number.
 *
 * Accepts 12-digit Pag-IBIG MID numbers in various formats:
 * - `123456789012` (raw 12 digits)
 * - `12-345678901-2` (formatted)
 *
 * Performs:
 * - Length check (12 digits)
 * - Digit-only check
 * - Basic structure validation
 *
 * @param pagibig - The Pag-IBIG MID string to validate
 * @returns True if the Pag-IBIG MID is valid
 *
 * @example
 * ```typescript
 * validatePagIBIG("12-345678901-2"); // true
 * validatePagIBIG("123456789012"); // true
 * validatePagIBIG("12345"); // false
 * ```
 */
export function validatePagIBIG(pagibig: string): boolean {
  if (isEmpty(pagibig)) return false;

  const cleaned = digitsOnly(pagibig);

  // Must be exactly 12 digits
  if (cleaned.length !== 12) return false;

  // Must be all digits
  if (!/^\d{12}$/.test(cleaned)) return false;

  // Validate prefix range (10-29)
  const prefix = parseInt(cleaned.slice(0, 2), 10);
  if (prefix < 10 || prefix > 29) return false;

  return true;
}

/**
 * Format a Pag-IBIG MID with dashes.
 *
 * @param pagibig - The Pag-IBIG MID string to format
 * @returns The formatted MID (e.g., "12-345678901-2")
 * @throws {Error} If the input is not a valid Pag-IBIG MID
 *
 * @example
 * ```typescript
 * formatPagIBIG("123456789012"); // "12-345678901-2"
 * formatPagIBIG("12-345678901-2"); // "12-345678901-2" (already formatted)
 * ```
 */
export function formatPagIBIG(pagibig: string): string {
  if (isEmpty(pagibig)) throw new Error("Pag-IBIG MID cannot be empty");

  const cleaned = digitsOnly(pagibig);

  if (cleaned.length !== 12) {
    throw new Error(`Cannot format "${pagibig}" as a Pag-IBIG MID (expected 12 digits)`);
  }

  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
}

/**
 * Remove dashes from a Pag-IBIG MID.
 *
 * @param pagibig - The Pag-IBIG MID string
 * @returns The MID with only digits
 */
export function stripPagIBIGDashes(pagibig: string): string {
  return digitsOnly(pagibig);
}

/**
 * Get the registration type label for a Pag-IBIG prefix.
 *
 * @param prefix - The 2-digit prefix
 * @returns Human-readable registration type string
 *
 * @example
 * ```typescript
 * getPagIBIGPrefixLabel("10"); // "Local Employee"
 * getPagIBIGPrefixLabel("11"); // "OFW (Overseas Filipino Worker)"
 * ```
 */
export function getPagIBIGPrefixLabel(prefix: string): string {
  return PAGIBIG_PREFIXES[prefix] || "Unknown";
}

/**
 * Parse a Pag-IBIG MID into its component parts.
 *
 * @param pagibig - The Pag-IBIG MID string to parse
 * @returns Detailed Pag-IBIG information object
 * @throws {Error} If the input is not a valid Pag-IBIG MID
 *
 * @example
 * ```typescript
 * const info = parsePagIBIG("12-345678901-2");
 * console.log(info.prefix); // "12"
 * console.log(info.registrationType); // "Employer"
 * console.log(info.sequenceNumber); // "345678901"
 * console.log(info.checkDigit); // "2"
 * ```
 */
export function parsePagIBIG(pagibig: string): PagIBIGInfo {
  if (isEmpty(pagibig)) {
    throw new Error("Pag-IBIG MID cannot be empty");
  }

  const cleaned = digitsOnly(pagibig);

  if (cleaned.length !== 12) {
    throw new Error(`Invalid Pag-IBIG MID: expected 12 digits, got ${cleaned.length}`);
  }

  if (!validatePagIBIG(pagibig)) {
    throw new Error(`Invalid Pag-IBIG MID: "${pagibig}"`);
  }

  const prefix = cleaned.slice(0, 2);
  const sequenceNumber = cleaned.slice(2, 10);
  const checkDigit = cleaned.slice(10, 12);

  return {
    valid: true,
    message: "",
    cleaned,
    formatted: formatPagIBIG(pagibig),
    digits: cleaned,
    registrationType: prefix,
    sequenceNumber,
    checkDigit,
  };
}

/**
 * Check if a Pag-IBIG MID belongs to an OFW.
 *
 * @param pagibig - The Pag-IBIG MID string
 * @returns True if the prefix indicates an OFW
 */
export function isOFWPagIBIG(pagibig: string): boolean {
  try {
    const info = parsePagIBIG(pagibig);
    return info.registrationType === "11";
  } catch {
    return false;
  }
}

/**
 * Check if a Pag-IBIG MID belongs to a government employee.
 *
 * @param pagibig - The Pag-IBIG MID string
 * @returns True if the prefix indicates a government employee
 */
export function isGovernmentEmployeePagIBIG(pagibig: string): boolean {
  try {
    const info = parsePagIBIG(pagibig);
    return info.registrationType === "18";
  } catch {
    return false;
  }
}

/**
 * Check if a Pag-IBIG MID belongs to a private/local employee.
 *
 * @param pagibig - The Pag-IBIG MID string
 * @returns True if the prefix indicates a local employee
 */
export function isLocalEmployeePagIBIG(pagibig: string): boolean {
  try {
    const info = parsePagIBIG(pagibig);
    return info.registrationType === "10";
  } catch {
    return false;
  }
}

/**
 * Check if a Pag-IBIG MID belongs to an employer.
 *
 * @param pagibig - The Pag-IBIG MID string
 * @returns True if the prefix indicates an employer
 */
export function isEmployerPagIBIG(pagibig: string): boolean {
  try {
    const info = parsePagIBIG(pagibig);
    return info.registrationType === "12";
  } catch {
    return false;
  }
}

/**
 * Check if a Pag-IBIG MID belongs to a military/uniformed personnel.
 *
 * @param pagibig - The Pag-IBIG MID string
 * @returns True if the prefix indicates military/uniformed personnel
 */
export function isMilitaryPagIBIG(pagibig: string): boolean {
  try {
    const info = parsePagIBIG(pagibig);
    return info.registrationType === "17";
  } catch {
    return false;
  }
}

/**
 * Generate a formatted Pag-IBIG MID from individual components.
 *
 * @param prefix - 2-digit registration type prefix
 * @param sequenceNumber - 8-digit sequential number
 * @param checkDigit - 2-digit check digit
 * @returns The formatted Pag-IBIG MID
 * @throws {Error} If components are invalid
 *
 * @example
 * ```typescript
 * createPagIBIG("10", "12345678", "12"); // "10-12345678-12"
 * ```
 */
export function createPagIBIG(
  prefix: string,
  sequenceNumber: string,
  checkDigit: string
): string {
  const pfx = digitsOnly(prefix).padStart(2, "0");
  const seq = digitsOnly(sequenceNumber).padStart(8, "0");
  const check = digitsOnly(checkDigit).padStart(2, "0");

  if (pfx.length !== 2) {
    throw new Error("Pag-IBIG prefix must be exactly 2 digits");
  }
  if (seq.length !== 8) {
    throw new Error("Pag-IBIG sequence number must be exactly 8 digits");
  }
  if (check.length !== 2) {
    throw new Error("Pag-IBIG check digit must be exactly 2 digits");
  }

  const prefixNum = parseInt(pfx, 10);
  if (prefixNum < 10 || prefixNum > 29) {
    throw new Error("Pag-IBIG prefix must be between 10 and 29");
  }

  return `${pfx}-${seq}-${check}`;
}

/**
 * Get all known Pag-IBIG registration type prefixes.
 *
 * @returns Object mapping prefix codes to registration type labels
 *
 * @example
 * ```typescript
 * const prefixes = getPagIBIGPrefixes();
 * console.log(prefixes); // { "10": "Local Employee", "11": "OFW", ... }
 * ```
 */
export function getPagIBIGPrefixes(): Record<string, string> {
  return { ...PAGIBIG_PREFIXES };
}
