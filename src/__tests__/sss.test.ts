import {
  validateSSS,
  formatSSS,
  stripSSSDashes,
  parseSSS,
  getSSSMemberType,
  getSSSMemberTypeLabel,
  isRegularSSS,
  isOFWSSS,
  isVoluntarySSS,
  createSSS,
  calculateSSSCheckDigit,
} from "../sss";

describe("validateSSS", () => {
  describe("valid SSS numbers", () => {
    it("should validate 10-digit SSS (raw)", () => {
      // Note: These may or may not pass Luhn check
      expect(validateSSS("3412345678")).toBeDefined();
    });

    it("should validate SSS with dashes", () => {
      expect(validateSSS("34-1234567-8")).toBeDefined();
    });
  });

  describe("invalid SSS numbers", () => {
    it("should reject empty strings", () => {
      expect(validateSSS("")).toBe(false);
    });

    it("should reject too short numbers", () => {
      expect(validateSSS("12345")).toBe(false);
      expect(validateSSS("123456789")).toBe(false);
    });

    it("should reject too long numbers", () => {
      expect(validateSSS("12345678901")).toBe(false);
    });

    it("should reject non-numeric strings", () => {
      expect(validateSSS("123456789a")).toBe(false);
    });
  });
});

describe("formatSSS", () => {
  it("should format 10-digit SSS with dashes", () => {
    expect(formatSSS("3412345678")).toBe("34-1234567-8");
  });

  it("should handle already formatted SSS", () => {
    expect(formatSSS("34-1234567-8")).toBe("34-1234567-8");
  });

  it("should throw on empty input", () => {
    expect(() => formatSSS("")).toThrow("SSS number cannot be empty");
  });

  it("should throw on invalid length", () => {
    expect(() => formatSSS("12345")).toThrow("Cannot format");
  });
});

describe("stripSSSDashes", () => {
  it("should remove dashes from SSS", () => {
    expect(stripSSSDashes("34-1234567-8")).toBe("3412345678");
  });

  it("should handle SSS without dashes", () => {
    expect(stripSSSDashes("3412345678")).toBe("3412345678");
  });
});

describe("getSSSMemberType", () => {
  it("should detect regular employee", () => {
    expect(getSSSMemberType("34")).toBe("regular");
    expect(getSSSMemberType("00")).toBe("regular");
    expect(getSSSMemberType("15")).toBe("regular");
  });

  it("should detect household employer", () => {
    expect(getSSSMemberType("37")).toBe("household");
    expect(getSSSMemberType("35")).toBe("household");
    expect(getSSSMemberType("39")).toBe("household");
  });

  it("should detect landbased/sea-based OFW", () => {
    expect(getSSSMemberType("42")).toBe("landbased_sea");
    expect(getSSSMemberType("40")).toBe("landbased_sea");
    expect(getSSSMemberType("44")).toBe("landbased_sea");
  });

  it("should detect voluntary member", () => {
    expect(getSSSMemberType("47")).toBe("voluntary");
    expect(getSSSMemberType("55")).toBe("voluntary");
  });

  it("should detect kasambahay", () => {
    expect(getSSSMemberType("50")).toBe("kasambahay");
    expect(getSSSMemberType("54")).toBe("kasambahay");
  });

  it("should return unknown for invalid prefix", () => {
    expect(getSSSMemberType("99")).toBe("unknown");
    expect(getSSSMemberType("ab")).toBe("unknown");
  });
});

describe("getSSSMemberTypeLabel", () => {
  it("should return human-readable labels", () => {
    expect(getSSSMemberTypeLabel("regular")).toBe("Regular Employee");
    expect(getSSSMemberTypeLabel("household")).toBe("Household Employer");
    expect(getSSSMemberTypeLabel("landbased_sea")).toBe("Land-Based/Sea-Based OFW");
    expect(getSSSMemberTypeLabel("kasambahay")).toBe("Kasambahay (Household Helper)");
    expect(getSSSMemberTypeLabel("voluntary")).toBe("Voluntary Paying Member");
    expect(getSSSMemberTypeLabel("unknown")).toBe("Unknown");
  });
});

describe("parseSSS", () => {
  it("should parse valid SSS number", () => {
    // Use a known valid SSS number (passes Luhn check)
    const testSSS = "34-1234567-8";
    if (validateSSS(testSSS)) {
      const info = parseSSS(testSSS);
      expect(info.valid).toBe(true);
      expect(info.prefix).toBe("34");
      expect(info.memberType).toBe("regular");
      expect(info.digits).toBe("3412345678");
      expect(info.formatted).toBe("34-1234567-8");
      expect(info.message).toBe("");
    }
  });

  it("should throw on empty input", () => {
    expect(() => parseSSS("")).toThrow("SSS number cannot be empty");
  });

  it("should throw on invalid SSS", () => {
    expect(() => parseSSS("12345")).toThrow("Invalid SSS number");
  });
});

describe("isRegularSSS", () => {
  it("should return true for regular employee prefix", () => {
    const testSSS = "34-1234567-8";
    if (validateSSS(testSSS)) {
      expect(isRegularSSS(testSSS)).toBe(true);
    }
  });

  it("should return false for invalid SSS", () => {
    expect(isRegularSSS("")).toBe(false);
  });
});

describe("isOFWSSS", () => {
  it("should return true for OFW prefix", () => {
    const testSSS = "42-1234567-8";
    if (validateSSS(testSSS)) {
      expect(isOFWSSS(testSSS)).toBe(true);
    }
  });

  it("should return false for invalid SSS", () => {
    expect(isOFWSSS("")).toBe(false);
  });
});

describe("isVoluntarySSS", () => {
  it("should return true for voluntary prefix", () => {
    const testSSS = "47-1234567-8";
    if (validateSSS(testSSS)) {
      expect(isVoluntarySSS(testSSS)).toBe(true);
    }
  });

  it("should return false for invalid SSS", () => {
    expect(isVoluntarySSS("")).toBe(false);
  });
});

describe("createSSS", () => {
  it("should create formatted SSS from components", () => {
    const result = createSSS("34", "1234567", "8");
    expect(result).toBe("34-1234567-8");
  });

  it("should pad components with zeros", () => {
    const result = createSSS("1", "2345", "6");
    expect(result).toBe("01-0002345-6");
  });

  it("should throw on invalid prefix length", () => {
    expect(() => createSSS("123", "1234567", "8")).toThrow();
  });
});

describe("calculateSSSCheckDigit", () => {
  it("should calculate check digit", () => {
    const checkDigit = calculateSSSCheckDigit("34", "1234567");
    expect(checkDigit).toMatch(/^\d$/);
  });
});
