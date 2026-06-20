/**
 * Philippine phone number validation, formatting, and carrier detection.
 *
 * Supports:
 * - Mobile numbers (Globe, Smart, DITO, TM, TNT, Sun, GOMO)
 * - Landline numbers (with area code detection)
 * - Toll-free numbers
 * - Multiple input formats (+63, 63, 0, etc.)
 *
 * @example
 * ```typescript
 * import { validatePHPhone, formatPHPhone, getPhoneInfo } from "ph-validation";
 *
 * // Basic validation
 * validatePHPhone("09171234567"); // true
 * validatePHPhone("+639171234567"); // true
 * validatePHPhone("12345"); // false
 *
 * // Formatting
 * formatPHPhone("09171234567"); // "+639171234567"
 * formatPHPhone("9171234567", "local"); // "0917 123 4567"
 *
 * // Detailed info
 * const info = getPhoneInfo("+639171234567");
 * info.carrier; // "Globe"
 * info.type; // "mobile"
 * ```
 *
 * @module phone
 */

import { PhoneInfo, PhilippineCarrier, MOBILE_PREFIXES, LANDLINE_AREA_CODES, TOLL_FREE_PREFIXES } from "./types";
import { digitsOnly, normalizePhone, isEmpty } from "./utils";

// Type exports for consumers
// Add specific types as needed

/**
 * Known Philippine mobile prefixes (first 4 digits after country code).
 * These are the leading digits of mobile numbers used in the Philippines.
 */
const MOBILE_PREFIX_MAP: Record<string, PhilippineCarrier> = {
  // Globe Telecom
  "905": "Globe",
  "906": "Globe",
  "915": "Globe",
  "916": "Globe",
  "917": "Globe",
  "926": "Globe",
  "927": "Globe",
  "935": "Globe",
  "936": "Globe",
  "937": "Globe",
  "945": "Globe",
  "953": "Globe",
  "955": "Globe",
  "956": "Globe",
  "965": "Globe",

  // TM (Touch Mobile) - Globe subsidiary
  "903": "TM",
  "932": "TM",
  "942": "TM",
  "943": "TM",
  "952": "TM",

  // Smart Communications
  "908": "Smart",
  "911": "Smart",
  "913": "Smart",
  "914": "Smart",
  "918": "Smart",
  "919": "Smart",
  "920": "Smart",
  "921": "Smart",
  "928": "Smart",
  "929": "Smart",
  "938": "Smart",
  "939": "Smart",
  "946": "Smart",
  "947": "Smart",
  "948": "Smart",
  "949": "Smart",
  "951": "Smart",
  "961": "Smart",
  "968": "Smart",
  "969": "Smart",
  "998": "Smart",

  // TNT (Talk 'N Text) - Smart subsidiary
  "907": "TNT",
  "909": "TNT",
  "910": "TNT",
  "922": "TNT",
  "925": "TNT",
  "930": "TNT",
  "931": "TNT",
  "941": "TNT",
  "981": "TNT",

  // Sun Cellular (now Smart)
  "923": "Sun",
  "924": "Sun",
  "933": "Sun",
  "940": "Sun",
  "944": "Sun",

  // DITO Telecommunity
  "991": "DITO",
  "992": "DITO",
  "993": "DITO",
  "994": "DITO",

  // GOMO (Globe sub-brand)
  "954": "Gomo",

  // Red Mobile
  "912": "Red",
};

/**
 * Validate a Philippine phone number.
 *
 * Accepts mobile and landline numbers in various formats:
 * - `09171234567` (local mobile)
 * - `+639171234567` (E.164)
 * - `639171234567` (without +)
 * - `02-8123-4567` (Manila landline)
 * - `02 8123 4567` (Manila landline with spaces)
 *
 * @param phone - The phone number string to validate
 * @returns True if the number is a valid Philippine phone number
 */
export function validatePHPhone(phone: string): boolean {
  if (isEmpty(phone)) return false;

  const cleaned = normalizePhone(phone);

  // Must start with 0, +63, or 63
  if (!/^(0|\+?63)/.test(cleaned) && !/^\d{7,12}$/.test(cleaned)) {
    return false;
  }

  // Remove leading 0 or 63 to get the subscriber number
  let subscriber: string;
  if (cleaned.startsWith("63")) {
    subscriber = cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    subscriber = cleaned.slice(1);
  } else {
    subscriber = cleaned;
  }

  // Mobile: 09XX + 9 digits = 12 digits total, subscriber starts with 9
  if (subscriber.startsWith("9")) {
    return /^\d{10}$/.test(subscriber);
  }

  // Landline: area code (2-3 digits) + subscriber number (7-8 digits)
  for (const [code] of Object.entries(LANDLINE_AREA_CODES)) {
    const areaCode = code;
    if (subscriber.startsWith(areaCode)) {
      const landlineNum = subscriber.slice(areaCode.length);
      return landlineNum.length >= 7 && landlineNum.length <= 8 && /^\d+$/.test(landlineNum);
    }
  }

  // Generic landline: 7-10 digit subscriber after area code
  if (/^\d{7,10}$/.test(subscriber)) {
    return true;
  }

  return false;
}

/**
 * Format a Philippine phone number to E.164 format.
 *
 * @param phone - The phone number string to format
 * @returns The formatted number in E.164 format (e.g., "+639171234567")
 * @throws {Error} If the input is not a valid Philippine phone number
 *
 * @example
 * ```typescript
 * formatPHPhone("09171234567"); // "+639171234567"
 * formatPHPhone("9171234567"); // "+639171234567"
 * formatPHPhone("+639171234567"); // "+639171234567"
 * ```
 */
export function formatPHPhone(phone: string): string {
  if (isEmpty(phone)) throw new Error("Phone number cannot be empty");

  const cleaned = normalizePhone(phone);

  // Already has +63 prefix
  if (cleaned.startsWith("63") && cleaned.length >= 12) {
    return `+${cleaned}`;
  }

  // Starts with 0
  if (cleaned.startsWith("0")) {
    return `+63${cleaned.slice(1)}`;
  }

  // Starts with 9 (mobile without prefix)
  if (cleaned.startsWith("9") && cleaned.length === 10) {
    return `+63${cleaned}`;
  }

  // Try to determine area code for landline
  for (const [code] of Object.entries(LANDLINE_AREA_CODES)) {
    if (cleaned.startsWith(code)) {
      const rest = cleaned.slice(code.length);
      if (rest.length >= 7 && rest.length <= 8) {
        return `+63${cleaned}`;
      }
    }
  }

  // If all else fails and it looks like a valid number, prepend +63
  if (/^\d{7,12}$/.test(cleaned)) {
    return `+63${cleaned}`;
  }

  throw new Error(`Cannot format "${phone}" as a Philippine phone number`);
}

/**
 * Format a Philippine phone number in a specific display format.
 *
 * @param phone - The phone number string to format
 * @param format - The display format
 *   - `"e164"`: E.164 format (default)
 *   - `"local"`: Local format with spaces (e.g., "0917 123 4567")
 *   - `"dashed"`: Dashed format (e.g., "0917-123-4567")
 *   - `"spaced"`: Spaced format (e.g., "+63 917 123 4567")
 *   - `"landline"`: Landline format (e.g., "(02) 8123-4567")
 * @returns The formatted phone number string
 */
export function formatPHPhoneStyle(
  phone: string,
  format: "e164" | "local" | "dashed" | "spaced" | "landline" = "e164"
): string {
  if (isEmpty(phone)) throw new Error("Phone number cannot be empty");

  const e164 = formatPHPhone(phone);
  const digits = e164.replace(/[^0-9]/g, ""); // Remove +
  const local = digits.startsWith("63") ? `0${digits.slice(2)}` : digits;

  switch (format) {
    case "e164":
      return e164;

    case "local":
      if (local.startsWith("09")) {
        // Mobile: 09XX XXX XXXX
        return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
      }
      // Landline: (0X) XXXX-XXXX or (0XX) XXX-XXXX
      const areaMatch = local.match(/^(0\d{1,2})/);
      if (areaMatch) {
        const area = areaMatch[1];
        const rest = local.slice(area.length);
        if (rest.length === 8) {
          return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
        }
        return `(${area}) ${rest.slice(0, 3)}-${rest.slice(3)}`;
      }
      return local;

    case "dashed":
      if (local.startsWith("09")) {
        return `${local.slice(0, 4)}-${local.slice(4, 7)}-${local.slice(7)}`;
      }
      return local;

    case "spaced":
      if (local.startsWith("09")) {
        return `+63 ${local.slice(1, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
      }
      return `+63 ${local.slice(1)}`;

    case "landline": {
      const am = local.match(/^(0\d{1,2})/);
      if (am) {
        const area = am[1];
        const rest = local.slice(area.length);
        if (rest.length === 8) {
          return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
        }
        return `(${area}) ${rest.slice(0, 3)}-${rest.slice(3)}`;
      }
      return local;
    }

    default:
      return e164;
  }
}

/**
 * Detect the Philippine mobile carrier for a given phone number.
 *
 * @param phone - The phone number string
 * @returns The detected carrier, or "Unknown" if not recognized
 *
 * @example
 * ```typescript
 * detectCarrier("09171234567"); // "Globe"
 * detectCarrier("09181234567"); // "Smart"
 * detectCarrier("09911234567"); // "DITO"
 * ```
 */
export function detectCarrier(phone: string): PhilippineCarrier {
  if (isEmpty(phone)) return "Unknown";

  const cleaned = normalizePhone(phone);

  // Get the 3-digit prefix after 0 or 63
  let prefix: string;
  if (cleaned.startsWith("09")) {
    prefix = cleaned.slice(1, 4); // e.g., "917"
  } else if (cleaned.startsWith("639")) {
    prefix = cleaned.slice(2, 5); // e.g., "917"
  } else if (cleaned.startsWith("9")) {
    prefix = cleaned.slice(0, 3); // e.g., "917"
  } else {
    return "Unknown";
  }

  return MOBILE_PREFIX_MAP[prefix] || "Unknown";
}

/**
 * Determine the type of Philippine phone number.
 *
 * @param phone - The phone number string
 * @returns The phone number type
 *
 * @example
 * ```typescript
 * getPhoneType("09171234567"); // "mobile"
 * getPhoneType("0281234567"); // "landline"
 * getPhoneType("1800123456"); // "toll-free"
 * ```
 */
export function getPhoneType(phone: string): PhoneInfo["type"] {
  if (isEmpty(phone)) return "unknown";

  const cleaned = normalizePhone(phone);

  // Check for toll-free
  for (const prefix of TOLL_FREE_PREFIXES) {
    if (cleaned.startsWith(prefix)) return "toll-free";
  }

  // Mobile: starts with 09 or 639 or +639
  if (/^(09|639|\+?639)/.test(cleaned) || /^(9)\d{9}$/.test(cleaned)) {
    return "mobile";
  }

  // Landline: starts with area code (02, 03X, 04X, etc.)
  for (const [code] of Object.entries(LANDLINE_AREA_CODES)) {
    if (cleaned.startsWith(code) || cleaned.startsWith(`63${code}`)) {
      return "landline";
    }
  }

  // Generic check: if it's 7-10 digits, likely landline
  const digits = digitsOnly(cleaned);
  if (digits.length >= 7 && digits.length <= 10) {
    return "landline";
  }

  return "unknown";
}

/**
 * Get detailed information about a Philippine phone number.
 *
 * Returns validation status, formatted number, carrier detection,
 * phone type, and area code (for landlines).
 *
 * @param phone - The phone number string to analyze
 * @returns Detailed phone information object
 *
 * @example
 * ```typescript
 * const info = getPhoneInfo("+639171234567");
 * console.log(info);
 * // {
 * //   valid: true,
 * //   formatted: "+639171234567",
 * //   type: "mobile",
 * //   carrier: "Globe",
 * //   areaCode: null,
 * //   message: "",
 * //   cleaned: "639171234567"
 * // }
 *
 * const landline = getPhoneInfo("(02) 8123-4567");
 * console.log(landline);
 * // {
 * //   valid: true,
 * //   formatted: "+63281234567",
 * //   type: "landline",
 * //   carrier: null,
 * //   areaCode: "02",
 * //   message: "",
 * //   cleaned: "0281234567"
 * // }
 * ```
 */
export function getPhoneInfo(phone: string): PhoneInfo {
  if (isEmpty(phone)) {
    return {
      valid: false,
      message: "Phone number is required",
      cleaned: "",
      formatted: "",
      type: "unknown",
      carrier: null,
      areaCode: null,
    };
  }

  const cleaned = normalizePhone(phone);
  const valid = validatePHPhone(phone);

  if (!valid) {
    return {
      valid: false,
      message: "Invalid Philippine phone number",
      cleaned,
      formatted: "",
      type: "unknown",
      carrier: null,
      areaCode: null,
    };
  }

  const type = getPhoneType(phone);
  const carrier = type === "mobile" ? detectCarrier(phone) : null;

  // Determine area code for landlines
  let areaCode: string | null = null;
  if (type === "landline") {
    for (const [code, region] of Object.entries(LANDLINE_AREA_CODES)) {
      if (cleaned.startsWith(code) || cleaned.startsWith(`63${code}`)) {
        areaCode = code;
        break;
      }
    }
  }

  let formatted: string;
  try {
    formatted = formatPHPhone(phone);
  } catch {
    formatted = "";
  }

  return {
    valid: true,
    message: "",
    cleaned,
    formatted,
    type,
    carrier,
    areaCode,
  };
}

/**
 * Check if a Philippine phone number is a mobile number.
 *
 * @param phone - The phone number string
 * @returns True if the number is a mobile number
 */
export function isMobile(phone: string): boolean {
  return getPhoneType(phone) === "mobile";
}

/**
 * Check if a Philippine phone number is a landline number.
 *
 * @param phone - The phone number string
 * @returns True if the number is a landline number
 */
export function isLandline(phone: string): boolean {
  return getPhoneType(phone) === "landline";
}

/**
 * Normalize a Philippine phone number to local format (09XX XXX XXXX).
 *
 * @param phone - The phone number string
 * @returns The normalized local format number, or empty string if invalid
 *
 * @example
 * ```typescript
 * normalizePHPhone("+639171234567"); // "09171234567"
 * normalizePHPhone("9171234567"); // "09171234567"
 * ```
 */
export function normalizePHPhone(phone: string): string {
  if (!validatePHPhone(phone)) return "";

  const cleaned = normalizePhone(phone);

  // Already in local format
  if (cleaned.startsWith("0")) return cleaned;

  // From 63 prefix
  if (cleaned.startsWith("63")) {
    return `0${cleaned.slice(2)}`;
  }

  // From +63 prefix (already stripped +)
  if (cleaned.startsWith("63")) {
    return `0${cleaned.slice(2)}`;
  }

  // Subscriber number only (starts with 9)
  if (cleaned.startsWith("9") && cleaned.length >= 10) {
    return `0${cleaned}`;
  }

  return cleaned;
}

/**
 * Get all known Philippine mobile prefixes grouped by carrier.
 *
 * @returns Object mapping carrier names to arrays of 3-digit prefixes
 *
 * @example
 * ```typescript
 * const prefixes = getMobilePrefixes();
 * console.log(prefixes.Globe); // ["905", "906", "915", "916", ...]
 * ```
 */
export function getMobilePrefixes(): Record<PhilippineCarrier, string[]> {
  const result: Record<string, string[]> = {};
  for (const [prefix, carrier] of Object.entries(MOBILE_PREFIX_MAP)) {
    if (!result[carrier]) result[carrier] = [];
    result[carrier].push(prefix);
  }
  return result as Record<PhilippineCarrier, string[]>;
}
