/**
 * Philippine Tax Identification Number (TIN) validation, formatting, and parsing.
 *
 * The TIN is a 12-digit number issued by the Bureau of Internal Revenue (BIR).
 * It can also appear in extended 15-digit format for certain entity types.
 *
 * Format: XXX-XXX-XXX-XXX (12 digits) or XXX-XXX-XXX-XXX-XXX (15 digits)
 *
 * Structure (12-digit):
 * - Digits 1-3: RDO (Revenue District Office) code
 * - Digits 4-6: Registration type
 * - Digits 7-9: Serial number
 * - Digits 10-12: Branch code (000 for main branch)
 *
 * @example
 * ```typescript
 * import { validateTIN, formatTIN, parseTIN } from "ph-validation";
 *
 * // Validation
 * validateTIN("123-456-789-000"); // true
 * validateTIN("123456789000"); // true
 * validateTIN("12345"); // false
 *
 * // Formatting
 * formatTIN("123456789000"); // "123-456-789-000"
 *
 * // Parsing
 * const info = parseTIN("123-456-789-000");
 * info.rdoCode; // "123"
 * info.branchCode; // "000"
 * ```
 *
 * @module tin
 */

import { TINInfo } from "./types";
import { digitsOnly, insertDashes, isEmpty, hasExactDigits } from "./utils";

// Type exports for consumers
// Add specific types as needed

/** Valid RDO (Revenue District Office) codes */
const VALID_RDO_CODES = new Set([
  "001", "002", "003", "004", "005", "006", "007", "008", "009", "010",
  "011", "012", "013", "014", "015", "016", "017", "018", "019", "020",
  "021", "022", "023", "024", "025", "026", "027", "028", "029", "030",
  "031", "032", "033", "034", "035", "036", "037", "038", "039", "040",
  "041", "042", "043", "044", "045", "046", "047", "048", "049", "050",
  "051", "052", "053", "054", "055", "056", "057", "058", "059", "060",
  "061", "062", "063", "064", "065", "066", "067", "068", "069", "070",
  "071", "072", "073", "074", "075", "076", "077", "078", "079", "080",
  "081", "082", "083", "084", "085", "086", "087", "088", "089", "090",
  "091", "092", "093", "094", "095", "096", "097", "098", "099", "100",
  "101", "102", "103", "104", "105", "106", "107", "108", "109", "110",
  "111", "112", "113", "114", "115", "116", "117", "118", "119", "120",
  "121", "122", "123", "124", "125", "126", "127", "128", "129", "130",
  "131", "132", "133", "134", "135", "136", "137", "138", "139", "140",
  "141", "142", "143", "144", "145", "146", "147", "148", "149", "150",
  "151", "152", "153", "154", "155", "156", "157", "158", "159", "160",
  "161", "162", "163", "164", "165", "166", "167", "168", "169", "170",
  "171", "172", "173", "174", "175", "176", "177", "178", "179", "180",
  "181", "182", "183", "184", "185", "186", "187", "188", "189", "190",
  "191", "192", "193", "194", "195", "196", "197", "198", "199", "200",
  "201", "202", "203", "204", "205", "206", "207", "208", "209", "210",
  "211", "212", "213", "214", "215", "216", "217", "218", "219", "220",
  "221", "222", "223", "224", "225", "226", "227", "228", "229", "230",
  "231", "232", "233", "234", "235", "236", "237", "238", "239", "240",
  "241", "242", "243", "244", "245", "246", "247", "248", "249", "250",
  "251", "252", "253", "254", "255", "256", "257", "258", "259", "260",
  "261", "262", "263", "264", "265", "266", "267", "268", "269", "270",
  "271", "272", "273", "274", "275", "276", "277", "278", "279", "280",
  "281", "282", "283", "284", "285", "286", "287", "288", "289", "290",
  "291", "292", "293", "294", "295", "296", "297", "298", "299", "300",
  "301", "302", "303", "304", "305", "306", "307", "308", "309", "310",
  "311", "312", "313", "314", "315", "316", "317", "318", "319", "320",
  "321", "322", "323", "324", "325", "326", "327", "328", "329", "330",
  "331", "332", "333", "334", "335", "336", "337", "338", "339", "340",
  "341", "342", "343", "344", "345", "346", "347", "348", "349", "350",
  "351", "352", "353", "354", "355", "356", "357", "358", "359", "360",
  "361", "362", "363", "364", "365", "366", "367", "368", "369", "370",
  "371", "372", "373", "374", "375", "376", "377", "378", "379", "380",
  "381", "382", "383", "384", "385", "386", "387", "388", "389", "390",
  "391", "392", "393", "394", "395", "396", "397", "398", "399", "400",
  "401", "402", "403", "404", "405", "406", "407", "408", "409", "410",
  "411", "412", "413", "414", "415", "416", "417", "418", "419", "420",
  "421", "422", "423", "424", "425", "426", "427", "428", "429", "430",
  "431", "432", "433", "434", "435", "436", "437", "438", "439", "440",
  "441", "442", "443", "444", "445", "446", "447", "448", "449", "450",
  "451", "452", "453", "454", "455", "456", "457", "458", "459", "460",
  "461", "462", "463", "464", "465", "466", "467", "468", "469", "470",
  "471", "472", "473", "474", "475", "476", "477", "478", "479", "480",
  "481", "482", "483", "484", "485", "486", "487", "488", "489", "490",
  "491", "492", "493", "494", "495", "496", "497", "498", "499", "500",
  "501", "502", "503", "504", "505", "506", "507", "508", "509", "510",
  "511", "512", "513", "514", "515", "516", "517", "518", "519", "520",
  "521", "522", "523", "524", "525", "526", "527", "528", "529", "530",
  "531", "532", "533", "534", "535", "536", "537", "538", "539", "540",
  "541", "542", "543", "544", "545", "546", "547", "548", "549", "550",
  "551", "552", "553", "554", "555", "556", "557", "558", "559", "560",
  "561", "562", "563", "564", "565", "566", "567", "568", "569", "570",
  "571", "572", "573", "574", "575", "576", "577", "578", "579", "580",
  "581", "582", "583", "584", "585", "586", "587", "588", "589", "590",
  "591", "592", "593", "594", "595", "596", "597", "598", "599", "600",
  "601", "602", "603", "604", "605", "606", "607", "608", "609", "610",
  "611", "612", "613", "614", "615", "616", "617", "618", "619", "620",
  "621", "622", "623", "624", "625", "626", "627", "628", "629", "630",
  "631", "632", "633", "634", "635", "636", "637", "638", "639", "640",
  "641", "642", "643", "644", "645", "646", "647", "648", "649", "650",
  "651", "652", "653", "654", "655", "656", "657", "658", "659", "660",
  "661", "662", "663", "664", "665", "666", "667", "668", "669", "670",
  "671", "672", "673", "674", "675", "676", "677", "678", "679", "680",
  "681", "682", "683", "684", "685", "686", "687", "688", "689", "690",
  "691", "692", "693", "694", "695", "696", "697", "698", "699", "700",
  "701", "702", "703", "704", "705", "706", "707", "708", "709", "710",
  "711", "712", "713", "714", "715", "716", "717", "718", "719", "720",
  "721", "722", "723", "724", "725", "726", "727", "728", "729", "730",
  "731", "732", "733", "734", "735", "736", "737", "738", "739", "740",
  "741", "742", "743", "744", "745", "746", "747", "748", "749", "750",
  "751", "752", "753", "754", "755", "756", "757", "758", "759", "760",
  "761", "762", "763", "764", "765", "766", "767", "768", "769", "770",
  "771", "772", "773", "774", "775", "776", "777", "778", "779", "780",
  "781", "782", "783", "784", "785", "786", "787", "788", "789", "790",
  "791", "792", "793", "794", "795", "796", "797", "798", "799", "800",
  "801", "802", "803", "804", "805", "806", "807", "808", "809", "810",
  "811", "812", "813", "814", "815", "816", "817", "818", "819", "820",
  "821", "822", "823", "824", "825", "826", "827", "828", "829", "830",
  "831", "832", "833", "834", "835", "836", "837", "838", "839", "840",
  "841", "842", "843", "844", "845", "846", "847", "848", "849", "850",
  "851", "852", "853", "854", "855", "856", "857", "858", "859", "860",
  "861", "862", "863", "864", "865", "866", "867", "868", "869", "870",
  "871", "872", "873", "874", "875", "876", "877", "878", "879", "880",
  "881", "882", "883", "884", "885", "886", "887", "888", "889", "890",
  "891", "892", "893", "894", "895", "896", "897", "898", "899", "900",
  "901", "902", "903", "904", "905", "906", "907", "908", "909", "910",
  "911", "912", "913", "914", "915", "916", "917", "918", "919", "920",
  "921", "922", "923", "924", "925", "926", "927", "928", "929", "930",
  "931", "932", "933", "934", "935", "936", "937", "938", "939", "940",
  "941", "942", "943", "944", "945", "946", "947", "948", "949", "950",
  "951", "952", "953", "954", "955", "956", "957", "958", "959", "960",
  "961", "962", "963", "964", "965", "966", "967", "968", "969", "970",
  "971", "972", "973", "974", "975", "976", "977", "978", "979", "980",
  "981", "982", "983", "984", "985", "986", "987", "988", "989", "990",
  "991", "992", "993", "994", "995", "996", "997", "998", "999",
]);

/** Valid registration type indicators (digits 4-6) */
const VALID_REGISTRATION_TYPES = new Set([
  "000", // Individual - single proprietor
  "100", // Partnership
  "200", // Corporation (domestic)
  "300", // Corporation (foreign)
  "400", // Government
  "500", // Cooperative
  "600", // Trust
  "700", // Non-stock/non-profit
  "800", // Others
]);

/**
 * Validate a Philippine Tax Identification Number (TIN).
 *
 * Accepts 12-digit or 15-digit TINs in various formats:
 * - `123456789000` (raw 12 digits)
 * - `123-456-789-000` (formatted 12 digits)
 * - `123456789000123` (raw 15 digits)
 * - `123-456-789-000-123` (formatted 15 digits)
 *
 * @param tin - The TIN string to validate
 * @returns True if the TIN is valid
 *
 * @example
 * ```typescript
 * validateTIN("123-456-789-000"); // true
 * validateTIN("123456789000"); // true
 * validateTIN("12345"); // false
 * validateTIN("123456789000123"); // true (15-digit)
 * ```
 */
export function validateTIN(tin: string): boolean {
  if (isEmpty(tin)) return false;

  const cleaned = digitsOnly(tin);

  // Accept 12-digit or 15-digit TIN
  if (cleaned.length !== 12 && cleaned.length !== 15) return false;

  // Must be all digits
  if (!/^\d+$/.test(cleaned)) return false;

  // For 12-digit TIN, validate structure
  if (cleaned.length === 12) {
    const rdoCode = cleaned.slice(0, 3);

    // RDO code validation (optional - some codes may not be in the list)
    // We do a basic range check instead of requiring exact codes
    const rdoNum = parseInt(rdoCode, 10);
    if (rdoNum < 0 || rdoNum > 999) return false;

    // Branch code should be 000 for main branch
    const branchCode = cleaned.slice(9, 12);
    if (!/^\d{3}$/.test(branchCode)) return false;
  }

  return true;
}

/**
 * Format a Philippine TIN with dashes.
 *
 * @param tin - The TIN string to format
 * @returns The formatted TIN (e.g., "123-456-789-000")
 * @throws {Error} If the input is not a valid TIN
 *
 * @example
 * ```typescript
 * formatTIN("123456789000"); // "123-456-789-000"
 * formatTIN("123-456-789-000"); // "123-456-789-000" (already formatted)
 * ```
 */
export function formatTIN(tin: string): string {
  if (isEmpty(tin)) throw new Error("TIN cannot be empty");

  const cleaned = digitsOnly(tin);

  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9, 12)}-${cleaned.slice(12)}`;
  }

  throw new Error(`Cannot format "${tin}" as a Philippine TIN (expected 12 or 15 digits)`);
}

/**
 * Remove dashes from a TIN string.
 *
 * @param tin - The TIN string to strip
 * @returns The TIN with only digits
 *
 * @example
 * ```typescript
 * stripTINDashes("123-456-789-000"); // "123456789000"
 * ```
 */
export function stripTINDashes(tin: string): string {
  return digitsOnly(tin);
}

/**
 * Parse a Philippine TIN into its component parts.
 *
 * @param tin - The TIN string to parse
 * @returns Detailed TIN information object
 * @throws {Error} If the input is not a valid TIN
 *
 * @example
 * ```typescript
 * const info = parseTIN("123-456-789-000");
 * console.log(info.rdoCode); // "123"
 * console.log(info.registrationType); // "456"
 * console.log(info.serialNumber); // "789"
 * console.log(info.branchCode); // "000"
 * ```
 */
export function parseTIN(tin: string): TINInfo {
  if (isEmpty(tin)) {
    throw new Error("TIN cannot be empty");
  }

  const cleaned = digitsOnly(tin);

  if (cleaned.length !== 12 && cleaned.length !== 15) {
    throw new Error(`Invalid TIN: expected 12 or 15 digits, got ${cleaned.length}`);
  }

  if (!validateTIN(tin)) {
    throw new Error(`Invalid TIN: "${tin}"`);
  }

  const formatted = formatTIN(tin);
  const digits = cleaned.split("");

  if (cleaned.length === 12) {
    return {
      valid: true,
      message: "",
      cleaned,
      formatted,
      digits,
      rdoCode: cleaned.slice(0, 3),
      registrationType: cleaned.slice(3, 6),
      serialNumber: cleaned.slice(6, 9),
      branchCode: cleaned.slice(9, 12),
    };
  }

  // 15-digit TIN
  return {
    valid: true,
    message: "",
    cleaned,
    formatted,
    digits,
    rdoCode: cleaned.slice(0, 3),
    registrationType: cleaned.slice(3, 6),
    serialNumber: cleaned.slice(6, 9),
    branchCode: cleaned.slice(9, 12),
  };
}

/**
 * Get the RDO (Revenue District Office) code from a TIN.
 *
 * @param tin - The TIN string
 * @returns The 3-digit RDO code, or null if invalid
 *
 * @example
 * ```typescript
 * getTINRDOCode("123-456-789-000"); // "123"
 * ```
 */
export function getTINRDOCode(tin: string): string | null {
  try {
    const info = parseTIN(tin);
    return info.rdoCode;
  } catch {
    return null;
  }
}

/**
 * Get the branch code from a TIN.
 * The branch code is typically "000" for the main branch.
 *
 * @param tin - The TIN string
 * @returns The 3-digit branch code, or null if invalid
 */
export function getTINBranchCode(tin: string): string | null {
  try {
    const info = parseTIN(tin);
    return info.branchCode;
  } catch {
    return null;
  }
}

/**
 * Check if a TIN represents a main branch (branch code = "000").
 *
 * @param tin - The TIN string
 * @returns True if the TIN is for a main branch
 */
export function isMainBranchTIN(tin: string): boolean {
  const branchCode = getTINBranchCode(tin);
  return branchCode === "000";
}

/**
 * Check if a TIN is in the extended 15-digit format.
 *
 * @param tin - The TIN string
 * @returns True if the TIN has 15 digits
 */
export function isExtendedTIN(tin: string): boolean {
  const cleaned = digitsOnly(tin);
  return cleaned.length === 15;
}

/**
 * Generate a formatted TIN from individual components.
 *
 * @param rdoCode - 3-digit RDO code
 * @param registrationType - 3-digit registration type
 * @param serialNumber - 3-digit serial number
 * @param branchCode - 3-digit branch code (default: "000")
 * @returns The formatted TIN
 *
 * @example
 * ```typescript
 * createTIN("123", "456", "789", "000"); // "123-456-789-000"
 * ```
 */
export function createTIN(
  rdoCode: string,
  registrationType: string,
  serialNumber: string,
  branchCode: string = "000"
): string {
  const rdo = digitsOnly(rdoCode).padStart(3, "0");
  const reg = digitsOnly(registrationType).padStart(3, "0");
  const serial = digitsOnly(serialNumber).padStart(3, "0");
  const branch = digitsOnly(branchCode).padStart(3, "0");

  if (rdo.length !== 3 || reg.length !== 3 || serial.length !== 3 || branch.length !== 3) {
    throw new Error("All TIN components must be exactly 3 digits");
  }

  return `${rdo}-${reg}-${serial}-${branch}`;
}
