import {
  validatePagIBIG,
  formatPagIBIG,
  stripPagIBIGDashes,
  parsePagIBIG,
  getPagIBIGPrefixLabel,
  isOFWPagIBIG,
  isGovernmentEmployeePagIBIG,
  isLocalEmployeePagIBIG,
  isEmployerPagIBIG,
  isMilitaryPagIBIG,
  createPagIBIG,
  getPagIBIGPrefixes,
} from "../pagibig";

describe("validatePagIBIG", () => {
  describe("valid Pag-IBIG MIDs", () => {
    it("should validate 12-digit MID (raw)", () => {
      expect(validatePagIBIG("123456789012")).toBe(true);
      expect(validatePagIBIG("101234567890")).toBe(true);
      expect(validatePagIBIG("201234567890")).toBe(true);
    });

    it("should validate 12-digit MID (with dashes)", () => {
      expect(validatePagIBIG("12-345678901-2")).toBe(true);
      expect(validatePagIBIG("10-123456789-0")).toBe(true);
    });

    it("should validate all valid prefix ranges (10-29)", () => {
      for (let i = 10; i <= 29; i++) {
        const prefix = i.toString().padStart(2, "0");
        expect(validatePagIBIG(`${prefix}1234567890`)).toBe(true);
      }
    });
  });

  describe("invalid Pag-IBIG MIDs", () => {
    it("should reject empty strings", () => {
      expect(validatePagIBIG("")).toBe(false);
    });

    it("should reject too short MIDs", () => {
      expect(validatePagIBIG("12345")).toBe(false);
      expect(validatePagIBIG("1234567890")).toBe(false);
      expect(validatePagIBIG("12345678901")).toBe(false);
    });

    it("should reject too long MIDs", () => {
      expect(validatePagIBIG("1234567890123")).toBe(false);
    });

    it("should reject non-numeric MIDs", () => {
      expect(validatePagIBIG("12345678901a")).toBe(false);
    });

    it("should reject invalid prefix ranges", () => {
      expect(validatePagIBIG("091234567890")).toBe(false); // prefix 09
      expect(validatePagIBIG("301234567890")).toBe(false); // prefix 30
      expect(validatePagIBIG("001234567890")).toBe(false); // prefix 00
    });
  });
});

describe("formatPagIBIG", () => {
  it("should format 12-digit MID with dashes", () => {
    expect(formatPagIBIG("123456789012")).toBe("12-345678901-2");
  });

  it("should handle already formatted MID", () => {
    expect(formatPagIBIG("12-345678901-2")).toBe("12-345678901-2");
  });

  it("should throw on empty input", () => {
    expect(() => formatPagIBIG("")).toThrow("Pag-IBIG MID cannot be empty");
  });

  it("should throw on invalid length", () => {
    expect(() => formatPagIBIG("12345")).toThrow("Cannot format");
  });
});

describe("stripPagIBIGDashes", () => {
  it("should remove dashes from MID", () => {
    expect(stripPagIBIGDashes("12-345678901-2")).toBe("123456789012");
  });

  it("should handle MID without dashes", () => {
    expect(stripPagIBIGDashes("123456789012")).toBe("123456789012");
  });
});

describe("getPagIBIGPrefixLabel", () => {
  it("should return correct labels", () => {
    expect(getPagIBIGPrefixLabel("10")).toBe("Local Employee");
    expect(getPagIBIGPrefixLabel("11")).toBe("OFW (Overseas Filipino Worker)");
    expect(getPagIBIGPrefixLabel("12")).toBe("Employer");
    expect(getPagIBIGPrefixLabel("13")).toBe("Voluntary");
    expect(getPagIBIGPrefixLabel("17")).toBe("Military/Uniformed Personnel");
    expect(getPagIBIGPrefixLabel("18")).toBe("Government Employee");
    expect(getPagIBIGPrefixLabel("20")).toBe("Regular Member");
  });

  it("should return Unknown for invalid prefix", () => {
    expect(getPagIBIGPrefixLabel("99")).toBe("Unknown");
  });
});

describe("parsePagIBIG", () => {
  it("should parse valid Pag-IBIG MID", () => {
    const info = parsePagIBIG("12-345678901-2");
    expect(info.valid).toBe(true);
    expect(info.registrationType).toBe("12");
    expect(info.sequenceNumber).toBe("345678901");
    expect(info.checkDigit).toBe("2");
    expect(info.formatted).toBe("12-345678901-2");
    expect(info.cleaned).toBe("123456789012");
    expect(info.message).toBe("");
  });

  it("should throw on empty input", () => {
    expect(() => parsePagIBIG("")).toThrow("Pag-IBIG MID cannot be empty");
  });

  it("should throw on invalid MID", () => {
    expect(() => parsePagIBIG("12345")).toThrow("Invalid Pag-IBIG MID");
  });
});

describe("isOFWPagIBIG", () => {
  it("should return true for OFW prefix", () => {
    expect(isOFWPagIBIG("11-123456789-0")).toBe(true);
  });

  it("should return false for non-OFW", () => {
    expect(isOFWPagIBIG("10-123456789-0")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isOFWPagIBIG("")).toBe(false);
  });
});

describe("isGovernmentEmployeePagIBIG", () => {
  it("should return true for government employee prefix", () => {
    expect(isGovernmentEmployeePagIBIG("18-123456789-0")).toBe(true);
  });

  it("should return false for non-government", () => {
    expect(isGovernmentEmployeePagIBIG("10-123456789-0")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isGovernmentEmployeePagIBIG("")).toBe(false);
  });
});

describe("isLocalEmployeePagIBIG", () => {
  it("should return true for local employee prefix", () => {
    expect(isLocalEmployeePagIBIG("10-123456789-0")).toBe(true);
  });

  it("should return false for non-local", () => {
    expect(isLocalEmployeePagIBIG("11-123456789-0")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isLocalEmployeePagIBIG("")).toBe(false);
  });
});

describe("isEmployerPagIBIG", () => {
  it("should return true for employer prefix", () => {
    expect(isEmployerPagIBIG("12-123456789-0")).toBe(true);
  });

  it("should return false for non-employer", () => {
    expect(isEmployerPagIBIG("10-123456789-0")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isEmployerPagIBIG("")).toBe(false);
  });
});

describe("isMilitaryPagIBIG", () => {
  it("should return true for military prefix", () => {
    expect(isMilitaryPagIBIG("17-123456789-0")).toBe(true);
  });

  it("should return false for non-military", () => {
    expect(isMilitaryPagIBIG("10-123456789-0")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isMilitaryPagIBIG("")).toBe(false);
  });
});

describe("createPagIBIG", () => {
  it("should create formatted MID from components", () => {
    expect(createPagIBIG("12", "34567890", "12")).toBe("12-34567890-12");
  });

  it("should pad components with zeros", () => {
    expect(createPagIBIG("1", "2345", "6")).toBe("10-00002345-06");
  });

  it("should throw on invalid prefix length", () => {
    expect(() => createPagIBIG("123", "34567890", "12")).toThrow();
  });

  it("should throw on invalid prefix range", () => {
    expect(() => createPagIBIG("09", "12345678", "12")).toThrow("prefix must be between 10 and 29");
    expect(() => createPagIBIG("30", "12345678", "12")).toThrow("prefix must be between 10 and 29");
  });
});

describe("getPagIBIGPrefixes", () => {
  it("should return all prefixes", () => {
    const prefixes = getPagIBIGPrefixes();
    expect(prefixes["10"]).toBe("Local Employee");
    expect(prefixes["11"]).toBe("OFW (Overseas Filipino Worker)");
    expect(Object.keys(prefixes).length).toBeGreaterThan(10);
  });
});
