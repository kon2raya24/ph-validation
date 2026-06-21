/**
 * Philippine Social Security System (SSS) number validation, formatting, and parsing.
 *
 * The SSS number is a 10-digit number issued by the Social Security System.
 *
 * Format: XX-XXXXXXX-X (with dashes) or 10 digits
 *
 * Structure:
 * - Digits 1-2: Prefix (indicates member type)
 * - Digits 3-9: Serial number
 * - Digit 10: Check digit (Luhn algorithm)
 *
 * Member type prefixes:
 * - 00-34: Regular employees
 * - 35-39: Household employers
 * - 40-44: Landbased sea-based OFWs
 * - 45-49: Voluntary paying members
 * - 50-54: Self-employed
 * - 55-60: Professional tax practitioners
 *
 * @example
 * ```typescript
 * import { validateSSS, formatSSS, parseSSS } from "ph-validation";
 *
 * // Validation
 * validateSSS("34-1234567-8"); // true
 * validateSSS("3412345678"); // true
 * validateSSS("12345"); // false
 *
 * // Formatting
 * formatSSS("3412345678"); // "34-1234567-8"
 *
 * // Parsing
 * const info = parseSSS("34-1234567-8");
 * info.memberType; // "regular"
 * info.prefix; // "34"
 * ```
 *
 * @module sss
 */

import { SSSInfo, SSSMemberType } from "./types";
import { digitsOnly, isEmpty, luhnCheck } from "./utils";

// Type exports for consumers
// Add specific types as needed

// Type exports for consumers
// Add specific types as needed

// Type exports for consumers
// Add specific types as needed

/** Member type prefix ranges */
const MEMBER_TYPE_RANGES: Array<{ start: number; end: number; type: SSSMemberType }> = [
  { start: 0, end: 34, type: "regular" },
  { start: 35, end: 39, type: "household" },
  { start: 40, end: 44, type: "landbased_sea" },
  { start: 45, end: 49, type: "voluntary" },
  { start: 50, end: 54, type: "kasambahay" },
  { start: 55, end: 60, type: "voluntary" },
];

/**
 * Validate a Philippine SSS number.
 *
 * Accepts 10-digit SSS numbers in various formats:
 * - `3412345678` (raw 10 digits)
 * - `34-1234567-8` (formatted)
 *
 * Performs:
 * - Length check (10 digits)
 * - Digit-only check
 * - Luhn check digit validation
 *
 * @param sss - The SSS number string to validate
 * @returns True if the SSS number is valid
 *
 * @example
 * ```typescript
 * validateSSS("34-1234567-8"); // true
 * validateSSS("3412345678"); // true
 * validateSSS("0000000000"); // false (invalid check digit)
 * validateSSS("12345"); // false (too short)
 * ```
 */
export function validateSSS(sss: string): boolean {
  if (isEmpty(sss)) return false;

  const cleaned = digitsOnly(sss);

  // Must be exactly 10 digits
  if (cleaned.length !== 10) return false;

  // Must be all digits
  if (!/^\d{10}$/.test(cleaned)) return false;

  // Validate using Luhn algorithm
  return luhnCheck(cleaned);
}

/**
 * Format an SSS number with dashes.
 *
 * @param sss - The SSS number string to format
 * @returns The formatted SSS number (e.g., "34-1234567-8")
 * @throws {Error} If the input is not a valid SSS number
 *
 * @example
 * ```typescript
 * formatSSS("3412345678"); // "34-1234567-8"
 * formatSSS("34-1234567-8"); // "34-1234567-8" (already formatted)
 * ```
 */
export function formatSSS(sss: string): string {
  if (isEmpty(sss)) throw new Error("SSS number cannot be empty");

  const cleaned = digitsOnly(sss);

  if (cleaned.length !== 10) {
    throw new Error(`Cannot format "${sss}" as an SSS number (expected 10 digits)`);
  }

  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}-${cleaned.slice(9)}`;
}

/**
 * Remove dashes from an SSS number.
 *
 * @param sss - The SSS number string
 * @returns The SSS number with only digits
 */
export function stripSSSDashes(sss: string): string {
  return digitsOnly(sss);
}

/**
 * Determine the member type from an SSS number prefix.
 *
 * @param prefix - The 2-digit prefix (first two digits of SSS number)
 * @returns The member type classification
 *
 * @example
 * ```typescript
 * getSSSMemberType("34"); // "regular"
 * getSSSMemberType("37"); // "household"
 * getSSSMemberType("42"); // "landbased_sea"
 * getSSSMemberType("47"); // "voluntary"
 * ```
 */
export function getSSSMemberType(prefix: string): SSSMemberType {
  const num = parseInt(prefix, 10);
  if (isNaN(num)) return "unknown";

  for (const range of MEMBER_TYPE_RANGES) {
    if (num >= range.start && num <= range.end) {
      return range.type;
    }
  }

  return "unknown";
}

/**
 * Parse an SSS number into its component parts.
 *
 * @param sss - The SSS number string to parse
 * @returns Detailed SSS information object
 * @throws {Error} If the input is not a valid SSS number
 *
 * @example
 * ```typescript
 * const info = parseSSS("34-1234567-8");
 * console.log(info.prefix); // "34"
 * console.log(info.memberType); // "regular"
 * console.log(info.digits); // "3412345678"
 * console.log(info.formatted); // "34-1234567-8"
 * ```
 */
export function parseSSS(sss: string): SSSInfo {
  if (isEmpty(sss)) {
    throw new Error("SSS number cannot be empty");
  }

  const cleaned = digitsOnly(sss);

  if (cleaned.length !== 10) {
    throw new Error(`Invalid SSS number: expected 10 digits, got ${cleaned.length}`);
  }

  if (!validateSSS(sss)) {
    throw new Error(`Invalid SSS number: "${sss}"`);
  }

  const prefix = cleaned.slice(0, 2);
  const memberType = getSSSMemberType(prefix);

  return {
    valid: true,
    message: "",
    cleaned,
    formatted: formatSSS(sss),
    digits: cleaned,
    memberType,
    prefix,
  };
}

/**
 * Get the member type label for display purposes.
 *
 * @param memberType - The member type from SSSInfo
 * @returns Human-readable member type string
 *
 * @example
 * ```typescript
 * getSSSMemberTypeLabel("regular"); // "Regular Employee"
 * getSSSMemberTypeLabel("household"); // "Household Employer"
 * getSSSMemberTypeLabel("landbased_sea"); // "Land-Based/Sea-Based OFW"
 * ```
 */
export function getSSSMemberTypeLabel(memberType: SSSMemberType): string {
  const labels: Record<SSSMemberType, string> = {
    regular: "Regular Employee",
    household: "Household Employer",
    landbased_sea: "Land-Based/Sea-Based OFW",
    kasambahay: "Kasambahay (Household Helper)",
    voluntary: "Voluntary Paying Member",
    unknown: "Unknown",
  };
  return labels[memberType] || "Unknown";
}

/**
 * Check if an SSS number belongs to a regular employee.
 *
 * @param sss - The SSS number string
 * @returns True if the member type is "regular"
 */
export function isRegularSSS(sss: string): boolean {
  try {
    const info = parseSSS(sss);
    return info.memberType === "regular";
  } catch {
    return false;
  }
}

/**
 * Check if an SSS number belongs to an OFW (Overseas Filipino Worker).
 *
 * @param sss - The SSS number string
 * @returns True if the member type is "landbased_sea"
 */
export function isOFWSSS(sss: string): boolean {
  try {
    const info = parseSSS(sss);
    return info.memberType === "landbased_sea";
  } catch {
    return false;
  }
}

/**
 * Check if an SSS number belongs to a voluntary member.
 *
 * @param sss - The SSS number string
 * @returns True if the member type is "voluntary"
 */
export function isVoluntarySSS(sss: string): boolean {
  try {
    const info = parseSSS(sss);
    return info.memberType === "voluntary";
  } catch {
    return false;
  }
}

/**
 * Generate a formatted SSS number from individual components.
 *
 * @param prefix - 2-digit member type prefix
 * @param serialNumber - 7-digit serial number
 * @param checkDigit - 1-digit check digit
 * @returns The formatted SSS number
 * @throws {Error} If components are invalid
 *
 * @example
 * ```typescript
 * createSSS("34", "1234567", "8"); // "34-1234567-8"
 * ```
 */
export function createSSS(
  prefix: string,
  serialNumber: string,
  checkDigit: string
): string {
  const pfx = digitsOnly(prefix).padStart(2, "0");
  const serial = digitsOnly(serialNumber).padStart(7, "0");
  const check = digitsOnly(checkDigit).padStart(1, "0");

  if (pfx.length !== 2) {
    throw new Error("SSS prefix must be exactly 2 digits");
  }
  if (serial.length !== 7) {
    throw new Error("SSS serial number must be exactly 7 digits");
  }
  if (check.length !== 1) {
    throw new Error("SSS check digit must be exactly 1 digit");
  }

  return `${pfx}-${serial}-${check}`;
}

/**
 * Calculate the SSS check digit for a given prefix and serial number.
 *
 * @param prefix - 2-digit prefix
 * @param serialNumber - 7-digit serial number
 * @returns The calculated check digit (0-9)
 *
 * @example
 * ```typescript
 * calculateSSSCheckDigit("34", "1234567"); // "8" (or whatever the Luhn result is)
 * ```
 */
export function calculateSSSCheckDigit(prefix: string, serialNumber: string): string {
  const pfx = digitsOnly(prefix).padStart(2, "0");
  const serial = digitsOnly(serialNumber).padStart(7, "0");
  const partial = pfx + serial; // 9 digits

  // Calculate Luhn check digit
  let sum = 0;
  let alternate = false;

  // Process from right to left, but we need to append 0 first
  for (let i = partial.length - 1; i >= 0; i--) {
    let n = parseInt(partial[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}
