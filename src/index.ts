/**
 * ph-validation
 * Philippine field validation utilities for Node.js/TypeScript
 *
 * @package kon2raya/ph-validation
 * @license MIT
 * @author kon2raya
 */

// Phone validation
export {
  validatePHPhone,
  formatPHPhone,
  formatPHPhoneStyle,
  detectCarrier,
  getPhoneType,
  getPhoneInfo,
  isMobile,
  isLandline,
  normalizePHPhone,
  getMobilePrefixes,
} from './phone';

// Government ID validation - TIN
export {
  validateTIN,
  formatTIN,
  stripTINDashes,
  parseTIN,
  getTINRDOCode,
  getTINBranchCode,
  isMainBranchTIN,
  isExtendedTIN,
  createTIN,
} from './tin';

// Government ID validation - SSS
export {
  validateSSS,
  formatSSS,
  stripSSSDashes,
  getSSSMemberType,
  parseSSS,
  getSSSMemberTypeLabel,
  isRegularSSS,
  isOFWSSS,
  isVoluntarySSS,
  createSSS,
  calculateSSSCheckDigit,
} from './sss';

// Government ID validation - PhilHealth
export {
  validatePhilHealth,
  formatPhilHealth,
  stripPhilHealthDashes,
  getPhilHealthPrefixLabel,
  parsePhilHealth,
  isEmployedPhilHealth,
  isEmployerPhilHealth,
  isSeniorCitizenPhilHealth,
  isOFWPhilHealth,
  createPhilHealth,
  calculatePhilHealthCheckDigit,
  getPhilHealthPrefixes,
} from './philhealth';

// Government ID validation - Pag-IBIG
export {
  validatePagIBIG,
  formatPagIBIG,
  stripPagIBIGDashes,
  getPagIBIGPrefixLabel,
  parsePagIBIG,
  isOFWPagIBIG,
  isGovernmentEmployeePagIBIG,
  isLocalEmployeePagIBIG,
  isEmployerPagIBIG,
  isMilitaryPagIBIG,
  createPagIBIG,
  getPagIBIGPrefixes,
} from './pagibig';

// Utility functions
export {
  digitsOnly,
  normalizePhone,
  isEmpty,
  insertDashes,
  hasExactDigits,
  luhnCheck,
} from './utils';

// Types
export type {
  ValidationResult,
  PhoneInfo,
  PhilippineCarrier,
  TINInfo,
  SSSInfo,
  SSSMemberType,
  PhilHealthInfo,
  PagIBIGInfo,
} from './types';

// Constants
export {
  MOBILE_PREFIXES,
  LANDLINE_AREA_CODES,
  TOLL_FREE_PREFIXES,
  TIN_PATTERN_12,
  TIN_PATTERN_15,
  TIN_DASHED_PATTERN,
  TIN_DASHED_EXTENDED_PATTERN,
} from './types';
