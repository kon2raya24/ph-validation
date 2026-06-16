/**
 * Shared types for Philippine field validation utilities.
 * @module types
 */

/** Result of a validation check */
export interface ValidationResult {
  /** Whether the input is valid */
  valid: boolean;
  /** Human-readable error message (empty string if valid) */
  message: string;
  /** The cleaned/normalized input */
  cleaned: string;
}

/** Detailed phone number information */
export interface PhoneInfo extends ValidationResult {
  /** The formatted phone number in E.164 format */
  formatted: string;
  /** Phone number type */
  type: "mobile" | "landline" | "toll-free" | "unknown";
  /** The detected carrier/network (null if unknown) */
  carrier: PhilippineCarrier | null;
  /** The detected region/area code (for landlines) */
  areaCode: string | null;
}

/** Philippine mobile carriers */
export type PhilippineCarrier =
  | "Globe"
  | "TM" // Touch Mobile (Globe subsidiary)
  | "Smart"
  | "TNT" // Talk 'N Text (Smart subsidiary)
  | "Sun" // Sun Cellular (now Smart)
  | "DITO"
  | "Gomo" // GOMO (Globe subsidiary)
  | "Red" // Red Mobile (Smart subsidiary)
  | "Unknown";

/** TIN validation result with parsed components */
export interface TINInfo extends ValidationResult {
  /** The formatted TIN with dashes */
  formatted: string;
  /** Individual digits of the TIN (12-digit format) */
  digits: string[];
  /** RDO (Revenue District Office) code (first 3 digits) */
  rdoCode: string;
  /** Registration type indicator (digits 4-6) */
  registrationType: string;
  /** Serial number (digits 7-9) */
  serialNumber: string;
  /** Branch code (last 3 digits) */
  branchCode: string;
}

/** SSS member type classification */
export type SSSMemberType =
  | "regular"
  | "household"
  | "landbased_sea"
  | "kasambahay"
  | "voluntary"
  | "unknown";

/** SSS validation result with parsed components */
export interface SSSInfo extends ValidationResult {
  /** The formatted SSS number with dashes */
  formatted: string;
  /** The 10-digit SSS number */
  digits: string;
  /** Detected member type */
  memberType: SSSMemberType;
  /** Prefix (first 2 digits) indicating member classification */
  prefix: string;
}

/** PhilHealth validation result with parsed components */
export interface PhilHealthInfo extends ValidationResult {
  /** The formatted PhilHealth ID with dashes */
  formatted: string;
  /** The 12-digit PhilHealth number */
  digits: string;
  /** Employer or individual prefix (first 2 digits) */
  prefix: string;
  /** Sequential number (middle 8 digits) */
  sequenceNumber: string;
  /** Check digit (last 2 digits) */
  checkDigit: string;
}

/** Pag-IBIG (HDMF) validation result with parsed components */
export interface PagIBIGInfo extends ValidationResult {
  /** The formatted MID number with dashes */
  formatted: string;
  /** The 12-digit Pag-IBIG MID */
  digits: string;
  /** Registration type (first 2 digits) */
  registrationType: string;
  /** Sequential number (middle 8 digits) */
  sequenceNumber: string;
  /** Check digit (last 2 digits) */
  checkDigit: string;
}

/** Philippine mobile network prefixes (first 2 digits after 09) */
export const MOBILE_PREFIXES: Record<string, PhilippineCarrier> = {
  // Globe prefixes
  "0905": "Globe",
  "0906": "Globe",
  "0915": "Globe",
  "0916": "Globe",
  "0917": "Globe",
  "0926": "Globe",
  "0927": "Globe",
  "0935": "Globe",
  "0936": "Globe",
  "0937": "Globe",
  "0945": "Globe",
  "0953": "Globe",
  "0954": "Globe",
  "0955": "Globe",
  "0956": "Globe",
  "0965": "Globe",

  // TM (Touch Mobile) prefixes
  "0903": "TM",
  "0912": "TM",
  "0932": "TM",
  "0942": "TM",
  "0943": "TM",
  "0952": "TM",

  // Smart prefixes
  "0908": "Smart",
  "0911": "Smart",
  "0913": "Smart",
  "0914": "Smart",
  "0918": "Smart",
  "0919": "Smart",
  "0920": "Smart",
  "0921": "Smart",
  "0928": "Smart",
  "0929": "Smart",
  "0938": "Smart",
  "0939": "Smart",
  "0946": "Smart",
  "0947": "Smart",
  "0948": "Smart",
  "0949": "Smart",
  "0951": "Smart",
  "0961": "Smart",
  "0968": "Smart",
  "0969": "Smart",

  // TNT (Talk 'N Text) prefixes
  "0907": "TNT",
  "0909": "TNT",
  "0910": "TNT",
  "0922": "TNT",
  "0925": "TNT",
  "0930": "TNT",
  "0931": "TNT",
  "0941": "TNT",
  "0981": "TNT",

  // Sun (Sun Cellular) prefixes
  "0923": "Sun",
  "0924": "Sun",
  "0933": "Sun",
  "0940": "Sun",
  "0944": "Sun",

  // DITO prefixes
  "0991": "DITO",
  "0992": "DITO",
  "0993": "DITO",
  "0994": "DITO",

  // Gomo prefixes (Globe sub-brand)
  // "0954" is listed under Globe above

  // Red Mobile (Smart sub-brand)
  // "0981" is listed under TNT above
};

/** Philippine landline area codes */
export const LANDLINE_AREA_CODES: Record<string, string> = {
  "02": "Metro Manila",
  "032": "Cebu",
  "033": "Iloilo",
  "034": "Bacolod",
  "035": "Tacloban",
  "036": "Ormoc",
  "038": "Tagbilaran",
  "042": "Lucena",
  "043": "Batangas",
  "044": "Calapan",
  "045": "Angeles",
  "046": "Dasmarinas",
  "047": "Olongapo",
  "049": "Naga",
  "052": "Legazpi",
  "053": "Sorsogon",
  "054": "Iriga",
  "055": "Masbate",
  "056": "Samar",
  "062": "Iloilo (ext)",
  "063": "Bacolod (ext)",
  "065": "Capiz",
  "072": "Dagupan",
  "073": "Baguio",
  "074": "La Trinidad",
  "075": "San Fernando, La Union",
  "077": "Candon",
  "082": "Davao",
  "083": "General Santos",
  "084": "Koronadal",
  "085": "Digos",
  "086": "Tagum",
  "087": "Cotabato",
  "088": "Cagayan de Oro",
  "089": "Bukidnon",
};

/** Toll-free numbers (800, 1800 prefixes) */
export const TOLL_FREE_PREFIXES = ["1800", "800"];

/** 12-digit TIN format: XXX-XXX-XXX-XXX */
export const TIN_PATTERN_12 = /^\d{12}$/;

/** 15-digit TIN format (with dashes): XXX-XXX-XXX-XXX-XXX */
export const TIN_PATTERN_15 = /^\d{15}$/;

/** Standard TIN with dashes: XXX-XXX-XXX-XXX */
export const TIN_DASHED_PATTERN = /^\d{3}-\d{3}-\d{3}-\d{3}$/;

/** Extended TIN with dashes: XXX-XXX-XXX-XXX-XXX */
export const TIN_DASHED_EXTENDED_PATTERN =
  /^\d{3}-\d{3}-\d{3}-\d{3}-\d{3}$/;
