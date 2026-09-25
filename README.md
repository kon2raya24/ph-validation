# ph-validation

Validators and formatters for the Philippine fields that show up in HR, payroll and sign-up forms: mobile and landline numbers, TIN, SSS, PhilHealth and Pag-IBIG MID. TypeScript source, compiled to CommonJS.

[![license](https://img.shields.io/github/license/kon2raya24/ph-validation)](https://github.com/kon2raya24/ph-validation/blob/main/LICENSE)

> **Need something you can `npm install` today?** Use [`@ph-dev-utils/core`](https://www.npmjs.com/package/@ph-dev-utils/core) (v0.5.0, source in [kon2raya24/ph-dev-utils](https://github.com/kon2raya24/ph-dev-utils)). It is published, and its validators cover TIN, SSS, PhilHealth and Pag-IBIG plus PhilSys, UMID, passport, PRC, driver's license and plate numbers. See [Moving to @ph-dev-utils/core](#moving-to-ph-dev-utilscore).

## Status

This package works if you build it yourself and load it with `require()`. It is not ready to publish.

- **Not on npm.** `ph-validation` returns 404 on the npm registry, so `npm install ph-validation` fails. `npm install github:kon2raya24/ph-validation` installs without `dist/` (it is gitignored and there is no `prepare` script), so `require('ph-validation')` then throws `MODULE_NOT_FOUND`. To use it, build from source (see [Install](#install-from-source)).
- **CommonJS only.** `package.json` points `exports["."].import` at `dist/index.mjs`, which the build never creates. `import ... from 'ph-validation'` in an ES module fails with `ERR_MODULE_NOT_FOUND`. `require()` works, and so does TypeScript compiled to CommonJS.
- **CI is red.** None of the 23 Actions runs on `main` (18–21 June 2026) got as far as running a step, because GitHub never started the jobs. Run locally, `npm test` also fails. TypeScript 6 no longer loads `@types/jest` automatically, so all 5 test files fail to compile (`TS2593`/`TS2304`) and no tests run. With type-checking turned off, 180 of 188 tests pass. The 8 that fail are real mismatches between the tests and the code (see [Known issues](#known-issues)).
- **`npm run build` exits with code 2** (`TS5107`: `moduleResolution` `node10` is deprecated in TypeScript 6) but still writes `dist/`. `npx tsc --ignoreDeprecations 6.0` builds cleanly.
- **Most ID checks only look at the format.** See [What each validator checks](#what-each-validator-checks). None of these functions can tell you whether an ID was actually issued.

## Install (from source)

```bash
git clone https://github.com/kon2raya24/ph-validation.git
cd ph-validation
npm ci
npx tsc --ignoreDeprecations 6.0   # writes dist/
npm pack                           # creates ph-validation-2.0.0.tgz

# then, in your own project:
npm install /path/to/ph-validation/ph-validation-2.0.0.tgz
```

This has only been checked on Node 26. `package.json` says `>=14`, but older versions haven't been tested.

## Quick start

```js
const {
  validatePHPhone,
  validateTIN,
  validateSSS,
  validatePhilHealth,
  validatePagIBIG,
} = require('ph-validation');

validatePHPhone('09171234567');      // true
validatePHPhone('+639171234567');    // true
validatePHPhone('12345');            // false

validateTIN('123-456-789-000');      // true
validateTIN('123456789000');         // true

validateSSS('34-1234567-4');         // true  (passes the Luhn check)
validateSSS('34-1234567-8');         // false (fails the Luhn check)

validatePhilHealth('12-345678901-2'); // true
validatePagIBIG('1210-1234-5678');    // true
```

In TypeScript, `import { validateTIN } from 'ph-validation'` works when your project compiles to CommonJS. It does not work under native ESM (see Status).

## What each validator checks

| Function | Accepts | Actually checks | Does not check |
| --- | --- | --- | --- |
| `validatePHPhone` | `09XXXXXXXXX`, `+639XXXXXXXXX`, `639XXXXXXXXX`, `9XXXXXXXXX`, landlines like `02-8123-4567` | Mobile: exactly 10 digits starting with `9` once a leading `0` or `63` is removed. Anything else passes if 7–10 digits remain once a leading `0` or `63` is removed | Real area codes or number ranges. `'1234567'` and `'0000000000'` both return `true` |
| `validateTIN` | 12 or 15 digits, dashes optional | Digit count only | RDO code, registration type, checksum. `'000-000-000-000'` passes. 9-digit TINs are **rejected** |
| `validateSSS` | 10 digits, dashes optional | Digit count, plus a Luhn check on all 10 digits The Luhn rule is this library's own assumption, and the code cites no source for it. Real SSS numbers may fail it |
| `validatePhilHealth` | 12 digits, dashes optional | Digit count only (a mod-11 value is calculated but never used) | Check digit, prefix |
| `validatePagIBIG` | 12 digits, dashes optional | Digit count, and the first two digits must be 10–29 | Check digit |

`null` or `undefined` input **throws** `Error('Invalid input')` instead of returning `false`, because of the shared `isEmpty()` helper. Check for missing values before you call these:

```js
validatePHPhone('');                 // false
// validatePHPhone(undefined)        -> throws Error('Invalid input')
```

## API

All 67 runtime exports are listed below, grouped by source file. Examples use `require('ph-validation')`.

### Phone (`src/phone.ts`)

`validatePHPhone`, `formatPHPhone`, `formatPHPhoneStyle`, `detectCarrier`, `getPhoneType`, `getPhoneInfo`, `isMobile`, `isLandline`, `normalizePHPhone`, `getMobilePrefixes`

```js
formatPHPhone('09171234567');                     // '+639171234567'
formatPHPhoneStyle('09171234567', 'local');       // '0917 123 4567'
formatPHPhoneStyle('09171234567', 'dashed');      // '0917-123-4567'
formatPHPhoneStyle('09171234567', 'spaced');      // '+63 917 123 4567'
normalizePHPhone('+639171234567');                // '09171234567'

detectCarrier('09171234567');                     // 'Globe'
detectCarrier('09181234567');                     // 'Smart'
detectCarrier('09911234567');                     // 'DITO'

getPhoneType('09171234567');                      // 'mobile'
getPhoneType('0281234567');                       // 'landline'
getPhoneType('1800123456');                       // 'toll-free'
isMobile('+639171234567');                        // true
isLandline('(02) 8123-4567');                     // true

getPhoneInfo('+639171234567');
// { valid: true, message: '', cleaned: '639171234567', formatted: '+639171234567',
//   type: 'mobile', carrier: 'Globe', areaCode: null }

getPhoneInfo('(02) 8123-4567');
// { valid: true, message: '', cleaned: '0281234567', formatted: '+63281234567',
//   type: 'landline', carrier: null, areaCode: '02' }
```

`formatPHPhone` throws if it can't format the input. `formatPHPhoneStyle` also accepts `'e164'` (the default) and `'landline'`, but see Known issues for Manila numbers.

Carrier detection uses a hard-coded table of 61 three-digit prefixes: Smart 21, Globe 15, TNT 9, TM 5, Sun 5, DITO 4, Gomo 1, Red 1. Carrier assignments change over time, and the table lists no source.

### TIN (`src/tin.ts`)

`validateTIN`, `formatTIN`, `stripTINDashes`, `parseTIN`, `getTINRDOCode`, `getTINBranchCode`, `isMainBranchTIN`, `isExtendedTIN`, `createTIN`

```js
formatTIN('123456789000');                        // '123-456-789-000'
formatTIN('123456789000001');                     // '123-456-789-000-001'
getTINRDOCode('123-456-789-000');                 // '123'
isMainBranchTIN('123-456-789-000');               // true
isExtendedTIN('123-456-789-000-001');             // true
createTIN('123', '456', '789', '000');            // '123-456-789-000'

parseTIN('123-456-789-000');
// { valid: true, message: '', cleaned: '123456789000', formatted: '123-456-789-000',
//   digits: ['1','2','3','4','5','6','7','8','9','0','0','0'],
//   rdoCode: '123', registrationType: '456', serialNumber: '789', branchCode: '000' }
```

`parseTIN` simply cuts the digits into groups of three. `rdoCode` is the first three digits and is not checked against a list of real RDOs. `parseTIN` and `formatTIN` throw on invalid input. The `get*` helpers return `null` instead.

### SSS (`src/sss.ts`)

`validateSSS`, `formatSSS`, `stripSSSDashes`, `getSSSMemberType`, `parseSSS`, `getSSSMemberTypeLabel`, `isRegularSSS`, `isOFWSSS`, `isVoluntarySSS`, `createSSS`, `calculateSSSCheckDigit`

```js
formatSSS('3412345674');                          // '34-1234567-4'
getSSSMemberType('34');                           // 'regular'
getSSSMemberTypeLabel('regular');                 // 'Regular Employee'
getSSSMemberTypeLabel('landbased_sea');           // 'Land-Based/Sea-Based OFW'
isRegularSSS('34-1234567-4');                     // true

parseSSS('34-1234567-4');
// { valid: true, message: '', cleaned: '3412345674', formatted: '34-1234567-4',
//   digits: '3412345674', memberType: 'regular', prefix: '34' }
```

The table that maps prefixes to member types (00–34 regular, 35–39 household, 40–44 land/sea-based OFW, 45–49 and 55–60 voluntary, 50–54 kasambahay) is hard-coded and cites no source. Don't base decisions on it. `calculateSSSCheckDigit` has a bug (see Known issues).

### PhilHealth (`src/philhealth.ts`)

`validatePhilHealth`, `formatPhilHealth`, `stripPhilHealthDashes`, `getPhilHealthPrefixLabel`, `parsePhilHealth`, `isEmployedPhilHealth`, `isEmployerPhilHealth`, `isSeniorCitizenPhilHealth`, `isOFWPhilHealth`, `createPhilHealth`, `calculatePhilHealthCheckDigit`, `getPhilHealthPrefixes`

```js
formatPhilHealth('123456789012');                 // '12-34567890-12'
getPhilHealthPrefixLabel('01');                   // 'Employed'
getPhilHealthPrefixLabel('12');                   // 'Employer'
isEmployerPhilHealth('12-345678901-2');           // true

parsePhilHealth('12-345678901-2');
// { valid: true, message: '', cleaned: '123456789012', formatted: '12-34567890-12',
//   digits: '123456789012', prefix: '12', sequenceNumber: '34567890', checkDigit: '12' }
```

The output is grouped 2-8-2. The file's own header comment says `XXXX-XXXX-XXXX`, and the tests expect `12-345678901-2` (2-9-1). `parsePhilHealth` does not return a `registrationType` label. Use `getPhilHealthPrefixLabel(info.prefix)` for that.

### Pag-IBIG / HDMF (`src/pagibig.ts`)

`validatePagIBIG`, `formatPagIBIG`, `stripPagIBIGDashes`, `getPagIBIGPrefixLabel`, `parsePagIBIG`, `isOFWPagIBIG`, `isGovernmentEmployeePagIBIG`, `isLocalEmployeePagIBIG`, `isEmployerPagIBIG`, `isMilitaryPagIBIG`, `createPagIBIG`, `getPagIBIGPrefixes`

```js
formatPagIBIG('121012345678');                    // '12-10123456-78'
getPagIBIGPrefixLabel('10');                      // 'Local Employee'
getPagIBIGPrefixLabel('11');                      // 'OFW (Overseas Filipino Worker)'
parsePagIBIG('1210-1234-5678').registrationType;  // '12'  (the prefix, not a label)
createPagIBIG('12', '34567890', '12');            // '12-34567890-12'
```

Grouping is 2-8-2 here too, while the header comment says `XXXX-XXXX-XXXX`. Like the SSS table, the prefix labels are hard-coded and cite no source.

### Utilities and constants

`digitsOnly`, `normalizePhone`, `isEmpty`, `insertDashes`, `hasExactDigits`, `luhnCheck`, plus `MOBILE_PREFIXES`, `LANDLINE_AREA_CODES` (35 entries), `TOLL_FREE_PREFIXES`, `TIN_PATTERN_12`, `TIN_PATTERN_15`, `TIN_DASHED_PATTERN`, `TIN_DASHED_EXTENDED_PATTERN`.

```js
digitsOnly('a1-2b3');                             // '123'
normalizePhone('+63 (917) 123-4567');             // '639171234567'
insertDashes('123456789');                        // '123-456-789'
luhnCheck('79927398713');                         // true
```

Types exported for TypeScript: `ValidationResult`, `PhoneInfo`, `PhilippineCarrier`, `TINInfo`, `SSSInfo`, `SSSMemberType`, `PhilHealthInfo`, `PagIBIGInfo` (see `src/types.ts`).

## Known issues

- **`calculateSSSCheckDigit` disagrees with `validateSSS`.** It starts the Luhn doubling on the wrong digit. `calculateSSSCheckDigit('34', '1234567')` returns `'8'`, but `validateSSS('3412345678')` is `false` (the Luhn-valid digit is `4`). In a 2,000-sample random run, its output failed `validateSSS` about 90% of the time. Several SSS tests hide this because they only assert `toBeDefined()` or run inside `if (validateSSS(...))`.
- **Two carrier tables that disagree.** `detectCarrier` uses an internal map, but the exported `MOBILE_PREFIXES` constant is a separate table. They differ on 0912 (`Red` vs `TM`), 0954 (`Gomo` vs `Globe`) and 0998 (`Smart` vs missing).
- **No `08xx` mobile prefixes.** DITO's 0895–0898 numbers are not recognised as mobile. `getPhoneType('08951234567')` returns `'landline'` with `areaCode` `'089'`.
- **Manila landline formatting is wrong.** `formatPHPhoneStyle('0281234567', 'landline')` returns `'(028) 123-4567'` where the test expects `'(02) 8123-4567'`. The `'local'` style has the same problem.
- **PhilHealth and Pag-IBIG grouping** doesn't match the tests or the doc comments (see above).
- **`createPagIBIG('1', '2345', '6')` throws.** `'1'` gets padded to `'01'`, which is outside the 10–29 range, but the test expects `'10-00002345-06'`.
- **Unused lists in `src/tin.ts`.** `VALID_RDO_CODES` and `VALID_REGISTRATION_TYPES` are defined but never used.
- **`jest.config.js` misspells `coverageThreshold` as `coverageThresholds`**, so coverage minimums aren't enforced. `vitest.config.ts` is left over from an earlier setup (the tests run on Jest, and Vitest isn't installed).
- **`package.json` points to the wrong GitHub user.** Its `repository`, `homepage` and `bugs` URLs use `github.com/kon2raya/...` instead of `kon2raya24`.

## Moving to @ph-dev-utils/core

[`@ph-dev-utils/core`](https://www.npmjs.com/package/@ph-dev-utils/core) is published on npm (v0.5.0). It needs Node 20+ and is ESM-only (`require()` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`).

```bash
npm install @ph-dev-utils/core
```

```js
import {
  validateTIN, formatTIN, validateSSS, formatSSS,
  validatePhilHealth, formatPhilHealth, validatePagIBIG, formatPagIBIG,
  parseMobile, toE164,
} from '@ph-dev-utils/core';

validateTIN('123456789');             // true
formatTIN('123456789000');            // '123-456-789-000'
validateSSS('34-1234567-8');          // true
formatSSS('3412345678');              // '34-1234567-8'
formatPhilHealth('123456789012');     // '12-345678901-2'
formatPagIBIG('121012345678');        // '1210-1234-5678'
parseMobile('08951234567');           // { e164: '+638951234567', national: '08951234567', network: 'DITO' }
parseMobile('12345');                 // null
toE164('09171234567');                // '+639171234567'
```

How the two differ:

| | ph-validation | @ph-dev-utils/core |
| --- | --- | --- |
| TIN lengths | 12 or 15 digits | 9 or 12 digits |
| SSS | 10 digits + Luhn | 10 digits |
| PhilHealth format | `12-34567890-12` | `12-345678901-2` |
| Pag-IBIG format | `12-10123456-78` | `1210-1234-5678` |
| Invalid format input | `format*` throws | `format*` returns `null` |
| Phone | `validatePHPhone` returns a boolean, loose | `parseMobile` / `parseLandline` return an object or `null` |
| Networks | Globe, Smart, TNT, TM, Sun, DITO, Gomo, Red | Globe, Smart, Sun, DITO (includes 0895–0898) |
| `null`/`undefined` input | throws | returns `false` |
| Extras only here | `parse*`, `create*`, prefix and member-type labels | — |
| Extras only there | — | PhilSys National ID, UMID, passport, PRC, driver's license, plate, peso formatting, PSGC regions/provinces/cities, holidays |

Both packages check the format only. Neither verifies an ID against the issuing agency.

## Related packages

- ZIP codes: this README used to list "ZIP code validation", but nothing in this repo does that. Use [`@ph-dev-utils/postal`](https://www.npmjs.com/package/@ph-dev-utils/postal) ([kon2raya24/ph-postal](https://github.com/kon2raya24/ph-postal)), which has 2,048 ZIP entries from GeoNames. For example, `findPostalCodesByZip('1000')` returns Manila.
- Barangays: [`@ph-dev-utils/psgc-barangays`](https://www.npmjs.com/package/@ph-dev-utils/psgc-barangays) ([kon2raya24/ph-psgc-barangays](https://github.com/kon2raya24/ph-psgc-barangays)) has the 42,046 barangays from PSA Q4 2024.

Both are ESM-only, like core.

## Development

```bash
npm ci
npm test          # currently fails to compile the tests (see Status)
npm run lint      # tsc --noEmit, currently exits 2 (TS5107)
npm run build     # exits 2 (TS5107) but still writes dist/
```

In a throwaway copy with `"types": ["jest", "node"]` and `"ignoreDeprecations": "6.0"` added to `tsconfig.json`, the tests compiled and ran (180 passed, 8 failed, the ones listed in [Known issues](#known-issues)), and `tsc --noEmit` exited 0. Neither change is in this repo yet.

## License

MIT, see [LICENSE](LICENSE).
