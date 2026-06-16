# ph-validation

Philippine field validation utilities for Node.js/TypeScript. Comprehensive, well-documented, and production-ready.

[![npm version](https://img.shields.io/npm/v/ph-validation.svg)](https://www.npmjs.com/package/ph-validation)
[![license](https://img.shields.io/npm/l/ph-validation.svg)](https://github.com/kon2raya/ph-validation/blob/main/LICENSE)

## Features

- 📱 **Phone Validation** — Mobile (Globe, Smart, DITO, TM, TNT, Sun), landline, toll-free with carrier detection
- 🆔 **TIN Validation** — Tax Identification Number with RDO code parsing
- 💳 **SSS Validation** — Social Security System with member type detection
- 🏥 **PhilHealth Validation** — Health insurance ID with registration type parsing
- 🏠 **Pag-IBIG Validation** — HDMF MID with member classification
- 📍 **ZIP Code Validation** — Philippine postal codes

## Installation

```bash
npm install ph-validation
```

## Quick Start

```typescript
import {
  validatePHPhone,
  validateTIN,
  validateSSS,
  validatePhilHealth,
  validatePagIBIG,
} from 'ph-validation';

// Phone validation
validatePHPhone('09171234567');     // true
validatePHPhone('+639****4567');    // true
validatePHPhone('12345');           // false

// TIN validation
validateTIN('123-456-789-000');     // true
validateTIN('123456789000');        // true

// SSS validation
validateSSS('34-1234567-8');        // true

// PhilHealth validation
validatePhilHealth('12-345678901-2'); // true

// Pag-IBIG validation
validatePagIBIG('12-345678901-2');  // true
```

## API Reference

### Phone Validation

```typescript
import {
  validatePHPhone,    // Validate Philippine phone number
  formatPHPhone,      // Format to E.164 (+639XXXXXXXXX)
  formatPHPhoneStyle, // Format in various styles
  detectCarrier,      // Detect mobile carrier (Globe, Smart, etc.)
  getPhoneType,       // Get phone type (mobile, landline, toll-free)
  getPhoneInfo,       // Get detailed phone information
  isMobile,           // Check if mobile number
  isLandline,         // Check if landline number
  normalizePHPhone,   // Normalize to local format (09XX XXX XXXX)
  getMobilePrefixes,  // Get all mobile prefixes by carrier
} from 'ph-validation';

// Validate
validatePHPhone('09171234567');     // true
validatePHPhone('+639****4567');    // true
validatePHPhone('02-8123-4567');    // true (Manila landline)

// Format
formatPHPhone('09171234567');       // '+639****4567'
formatPHPhoneStyle('09171234567', 'local');    // '0917 123 4567'
formatPHPhoneStyle('09171234567', 'dashed');   // '0917-123-4567'
formatPHPhoneStyle('09171234567', 'spaced');   // '+63 917 123 4567'

// Carrier detection
detectCarrier('09171234567');       // 'Globe'
detectCarrier('09181234567');       // 'Smart'
detectCarrier('09911234567');       // 'DITO'

// Detailed info
const info = getPhoneInfo('+639****4567');
// {
//   valid: true,
//   formatted: '+639****4567',
//   type: 'mobile',
//   carrier: 'Globe',
//   areaCode: null,
//   message: '',
//   cleaned: '639171234567'
// }
```

### TIN Validation

```typescript
import {
  validateTIN,         // Validate TIN
  formatTIN,           // Format with dashes (XXX-XXX-XXX-XXX)
  parseTIN,            // Parse into components
  getTINRDOCode,       // Get RDO code
  getTINBranchCode,    // Get branch code (000 = main)
  isMainBranchTIN,     // Check if main branch
  isExtendedTIN,       // Check if 15-digit format
  createTIN,           // Create from components
} from 'ph-validation';

// Validate
validateTIN('123-456-789-000');     // true
validateTIN('123456789000');        // true
validateTIN('123456789000123');     // true (15-digit)

// Format
formatTIN('123456789000');          // '123-456-789-000'

// Parse
const info = parseTIN('123-456-789-000');
// {
//   rdoCode: '123',
//   registrationType: '456',
//   serialNumber: '789',
//   branchCode: '000',
//   formatted: '123-456-789-000'
// }

// Create
createTIN('123', '456', '789', '000'); // '123-456-789-000'
```

### SSS Validation

```typescript
import {
  validateSSS,           // Validate SSS number
  formatSSS,             // Format with dashes (XX-XXXXXXX-X)
  parseSSS,              // Parse into components
  getSSSMemberType,      // Get member type from prefix
  getSSSMemberTypeLabel, // Get human-readable member type
  isRegularSSS,          // Check if regular employee
  isOFWSSS,              // Check if OFW
  isVoluntarySSS,        // Check if voluntary member
  calculateSSSCheckDigit, // Calculate check digit
} from 'ph-validation';

// Validate
validateSSS('34-1234567-8');        // true
validateSSS('3412345678');          // true

// Parse
const info = parseSSS('34-1234567-8');
// {
//   prefix: '34',
//   memberType: 'regular',
//   digits: '3412345678',
//   formatted: '34-1234567-8'
// }

// Member types
getSSSMemberTypeLabel('regular');    // 'Regular Employee'
getSSSMemberTypeLabel('household');  // 'Household Employer'
getSSSMemberTypeLabel('landbased_sea'); // 'Land-Based/Sea-Based OFW'
```

### PhilHealth Validation

```typescript
import {
  validatePhilHealth,      // Validate PhilHealth ID
  formatPhilHealth,        // Format with dashes (XX-XXXXXXXX-X)
  parsePhilHealth,         // Parse into components
  getPhilHealthPrefixLabel, // Get registration type
  isEmployedPhilHealth,    // Check if employed
  isOFWPhilHealth,         // Check if OFW
  calculatePhilHealthCheckDigit, // Calculate check digit
} from 'ph-validation';

// Validate
validatePhilHealth('12-345678901-2');  // true
validatePhilHealth('123456789012');    // true

// Parse
const info = parsePhilHealth('12-345678901-2');
// {
//   prefix: '12',
//   registrationType: 'Employer',
//   sequenceNumber: '345678901',
//   checkDigit: '2'
// }

// Registration types
getPhilHealthPrefixLabel('01');  // 'Employed'
getPhilHealthPrefixLabel('12');  // 'Employer'
getPhilHealthPrefixLabel('15');  // 'OFW (Overseas Filipino Worker)'
```

### Pag-IBIG Validation

```typescript
import {
  validatePagIBIG,         // Validate Pag-IBIG MID
  formatPagIBIG,           // Format with dashes (XX-XXXXXXXX-X)
  parsePagIBIG,            // Parse into components
  getPagIBIGPrefixLabel,   // Get member type
  isOFWPagIBIG,            // Check if OFW
  isGovernmentEmployeePagIBIG, // Check if government employee
  isLocalEmployeePagIBIG,  // Check if local employee
} from 'ph-validation';

// Validate
validatePagIBIG('12-345678901-2');   // true
validatePagIBIG('123456789012');     // true

// Parse
const info = parsePagIBIG('12-345678901-2');
// {
//   registrationType: '12',
//   sequenceNumber: '345678901',
//   checkDigit: '2'
// }

// Member types
getPagIBIGPrefixLabel('10');  // 'Local Employee'
getPagIBIGPrefixLabel('11');  // 'OFW (Overseas Filipino Worker)'
getPagIBIGPrefixLabel('18');  // 'Government Employee'
```

## Types

```typescript
interface ValidationResult {
  valid: boolean;
  message: string;
  cleaned: string;
}

interface PhoneInfo extends ValidationResult {
  formatted: string;
  type: 'mobile' | 'landline' | 'toll-free' | 'unknown';
  carrier: PhilippineCarrier | null;
  areaCode: string | null;
}

type PhilippineCarrier = 'Globe' | 'TM' | 'Smart' | 'TNT' | 'Sun' | 'DITO' | 'Gomo' | 'Red' | 'Unknown';

interface TINInfo extends ValidationResult {
  formatted: string;
  digits: string[];
  rdoCode: string;
  registrationType: string;
  serialNumber: string;
  branchCode: string;
}

interface SSSInfo extends ValidationResult {
  formatted: string;
  digits: string;
  memberType: SSSMemberType;
  prefix: string;
}

type SSSMemberType = 'regular' | 'household' | 'landbased_sea' | 'kasambahay' | 'voluntary' | 'unknown';
```

## Examples

### Form Validation

```typescript
import { validatePHPhone, validateTIN } from 'ph-validation';

function handleFormSubmit(data: any) {
  if (!validatePHPhone(data.phone)) {
    throw new Error('Invalid Philippine phone number');
  }

  if (data.tin && !validateTIN(data.tin)) {
    throw new Error('Invalid TIN format');
  }

  // Process form...
}
```

### Employee Registration

```typescript
import {
  validateSSS,
  validatePhilHealth,
  validatePagIBIG,
  parseSSS,
  parsePhilHealth,
} from 'ph-validation';

function registerEmployee(employee: any) {
  // Validate all IDs
  if (!validateSSS(employee.sss)) throw new Error('Invalid SSS');
  if (!validatePhilHealth(employee.philhealth)) throw new Error('Invalid PhilHealth');
  if (!validatePagIBIG(employee.pagibig)) throw new Error('Invalid Pag-IBIG');

  // Get member info
  const sssInfo = parseSSS(employee.sss);
  console.log(`SSS Member Type: ${sssInfo.memberType}`);

  const phInfo = parsePhilHealth(employee.philhealth);
  console.log(`PhilHealth Type: ${phInfo.registrationType}`);

  // Save employee...
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © kon2raya
