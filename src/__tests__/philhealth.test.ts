import {
  validatePhilHealth,
  formatPhilHealth,
  stripPhilHealthDashes,
  parsePhilHealth,
  getPhilHealthPrefixLabel,
  isEmployedPhilHealth,
  isEmployerPhilHealth,
  isSeniorCitizenPhilHealth,
  isOFWPhilHealth,
  createPhilHealth,
  calculatePhilHealthCheckDigit,
  getPhilHealthPrefixes,
} from "../philhealth";

describe("validatePhilHealth", () => {
  describe("valid PhilHealth IDs", () => {
    it("should validate 12-digit ID (raw)", () => {
      expect(validatePhilHealth("123456789012")).toBe(true);
      expect(validatePhilHealth("012345678901")).toBe(true);
      expect(validatePhilHealth("999999999999")).toBe(true);
    });

    it("should validate 12-digit ID (with dashes)", () => {
      expect(validatePhilHealth("12-345678901-2")).toBe(true);
      expect(validatePhilHealth("01-234567890-1")).toBe(true);
    });
  });

  describe("invalid PhilHealth IDs", () => {
    it("should reject empty strings", () => {
      expect(validatePhilHealth("")).toBe(false);
    });

    it("should reject too short IDs", () => {
      expect(validatePhilHealth("12345")).toBe(false);
      expect(validatePhilHealth("1234567890")).toBe(false);
      expect(validatePhilHealth("12345678901")).toBe(false);
    });

    it("should reject too long IDs", () => {
      expect(validatePhilHealth("1234567890123")).toBe(false);
    });

    it("should reject non-numeric IDs", () => {
      expect(validatePhilHealth("12345678901a")).toBe(false);
    });

    it("should reject 11-digit IDs", () => {
      expect(validatePhilHealth("12345678901")).toBe(false);
    });

    it("should reject 13-digit IDs", () => {
      expect(validatePhilHealth("1234567890123")).toBe(false);
    });
  });
});

describe("formatPhilHealth", () => {
  it("should format 12-digit ID with dashes", () => {
    expect(formatPhilHealth("123456789012")).toBe("12-345678901-2");
  });

  it("should handle already formatted ID", () => {
    expect(formatPhilHealth("12-345678901-2")).toBe("12-345678901-2");
  });

  it("should throw on empty input", () => {
    expect(() => formatPhilHealth("")).toThrow("PhilHealth ID cannot be empty");
  });

  it("should throw on invalid length", () => {
    expect(() => formatPhilHealth("12345")).toThrow("Cannot format");
  });
});

describe("stripPhilHealthDashes", () => {
  it("should remove dashes from PhilHealth ID", () => {
    expect(stripPhilHealthDashes("12-345678901-2")).toBe("123456789012");
  });

  it("should handle ID without dashes", () => {
    expect(stripPhilHealthDashes("123456789012")).toBe("123456789012");
  });
});

describe("getPhilHealthPrefixLabel", () => {
  it("should return correct labels", () => {
    expect(getPhilHealthPrefixLabel("01")).toBe("Employed");
    expect(getPhilHealthPrefixLabel("02")).toBe("Self-Employed");
    expect(getPhilHealthPrefixLabel("03")).toBe("Voluntary");
    expect(getPhilHealthPrefixLabel("05")).toBe("Senior Citizen");
    expect(getPhilHealthPrefixLabel("06")).toBe("Indigent (4Ps)");
    expect(getPhilHealthPrefixLabel("12")).toBe("Employer");
    expect(getPhilHealthPrefixLabel("15")).toBe("OFW (Overseas Filipino Worker)");
  });

  it("should return Unknown for invalid prefix", () => {
    expect(getPhilHealthPrefixLabel("99")).toBe("Unknown");
  });
});

describe("parsePhilHealth", () => {
  it("should parse valid PhilHealth ID", () => {
    const info = parsePhilHealth("12-345678901-2");
    expect(info.valid).toBe(true);
    expect(info.prefix).toBe("12");
    expect(info.sequenceNumber).toBe("345678901");
    expect(info.checkDigit).toBe("2");
    expect(info.formatted).toBe("12-345678901-2");
    expect(info.cleaned).toBe("123456789012");
    expect(info.message).toBe("");
  });

  it("should throw on empty input", () => {
    expect(() => parsePhilHealth("")).toThrow("PhilHealth ID cannot be empty");
  });

  it("should throw on invalid PhilHealth ID", () => {
    expect(() => parsePhilHealth("12345")).toThrow("Invalid PhilHealth ID");
  });
});

describe("isEmployedPhilHealth", () => {
  it("should return true for employed prefix", () => {
    expect(isEmployedPhilHealth("01-234567890-1")).toBe(true);
  });

  it("should return false for non-employed", () => {
    expect(isEmployedPhilHealth("12-345678901-2")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isEmployedPhilHealth("")).toBe(false);
  });
});

describe("isEmployerPhilHealth", () => {
  it("should return true for employer prefix", () => {
    expect(isEmployerPhilHealth("12-345678901-2")).toBe(true);
  });

  it("should return false for non-employer", () => {
    expect(isEmployerPhilHealth("01-234567890-1")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isEmployerPhilHealth("")).toBe(false);
  });
});

describe("isSeniorCitizenPhilHealth", () => {
  it("should return true for senior citizen prefix", () => {
    expect(isSeniorCitizenPhilHealth("05-123456789-0")).toBe(true);
  });

  it("should return false for non-senior", () => {
    expect(isSeniorCitizenPhilHealth("01-234567890-1")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isSeniorCitizenPhilHealth("")).toBe(false);
  });
});

describe("isOFWPhilHealth", () => {
  it("should return true for OFW prefix", () => {
    expect(isOFWPhilHealth("15-123456789-0")).toBe(true);
  });

  it("should return false for non-OFW", () => {
    expect(isOFWPhilHealth("01-234567890-1")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isOFWPhilHealth("")).toBe(false);
  });
});

describe("createPhilHealth", () => {
  it("should create formatted PhilHealth ID from components", () => {
    expect(createPhilHealth("12", "34567890", "12")).toBe("12-34567890-12");
  });

  it("should pad components with zeros", () => {
    expect(createPhilHealth("1", "2345", "6")).toBe("01-00002345-06");
  });

  it("should throw on invalid prefix length", () => {
    expect(() => createPhilHealth("123", "34567890", "12")).toThrow();
  });
});

describe("calculatePhilHealthCheckDigit", () => {
  it("should calculate check digit", () => {
    const checkDigit = calculatePhilHealthCheckDigit("12", "34567890");
    expect(checkDigit).toMatch(/^\d{2}$/);
  });
});

describe("getPhilHealthPrefixes", () => {
  it("should return all prefixes", () => {
    const prefixes = getPhilHealthPrefixes();
    expect(prefixes["01"]).toBe("Employed");
    expect(prefixes["12"]).toBe("Employer");
    expect(Object.keys(prefixes).length).toBeGreaterThan(10);
  });
});
