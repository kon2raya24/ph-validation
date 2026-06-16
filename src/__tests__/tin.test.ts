import {
  validateTIN,
  formatTIN,
  stripTINDashes,
  parseTIN,
  getTINRDOCode,
  getTINBranchCode,
  isMainBranchTIN,
  isExtendedTIN,
  createTIN,
} from "../tin";

describe("validateTIN", () => {
  describe("valid TINs", () => {
    it("should validate 12-digit TIN (raw)", () => {
      expect(validateTIN("123456789000")).toBe(true);
      expect(validateTIN("000000000000")).toBe(true);
      expect(validateTIN("999999999999")).toBe(true);
    });

    it("should validate 12-digit TIN (with dashes)", () => {
      expect(validateTIN("123-456-789-000")).toBe(true);
      expect(validateTIN("000-000-000-000")).toBe(true);
    });

    it("should validate 15-digit TIN (raw)", () => {
      expect(validateTIN("123456789000123")).toBe(true);
    });

    it("should validate 15-digit TIN (with dashes)", () => {
      expect(validateTIN("123-456-789-000-123")).toBe(true);
    });
  });

  describe("invalid TINs", () => {
    it("should reject empty strings", () => {
      expect(validateTIN("")).toBe(false);
    });

    it("should reject too short TINs", () => {
      expect(validateTIN("12345")).toBe(false);
      expect(validateTIN("1234567890")).toBe(false);
      expect(validateTIN("12345678900")).toBe(false);
    });

    it("should reject too long TINs", () => {
      expect(validateTIN("1234567890001")).toBe(false);
      expect(validateTIN("12345678900012")).toBe(false);
    });

    it("should reject 13-digit TINs", () => {
      expect(validateTIN("1234567890001")).toBe(false);
    });

    it("should reject 14-digit TINs", () => {
      expect(validateTIN("12345678900012")).toBe(false);
    });

    it("should reject non-numeric TINs", () => {
      expect(validateTIN("12345678900a")).toBe(false);
    });
  });
});

describe("formatTIN", () => {
  it("should format 12-digit TIN with dashes", () => {
    expect(formatTIN("123456789000")).toBe("123-456-789-000");
  });

  it("should format 15-digit TIN with dashes", () => {
    expect(formatTIN("123456789000123")).toBe("123-456-789-000-123");
  });

  it("should handle already formatted TIN", () => {
    expect(formatTIN("123-456-789-000")).toBe("123-456-789-000");
  });

  it("should throw on empty input", () => {
    expect(() => formatTIN("")).toThrow("TIN cannot be empty");
  });

  it("should throw on invalid length", () => {
    expect(() => formatTIN("12345")).toThrow("Cannot format");
  });
});

describe("stripTINDashes", () => {
  it("should remove dashes from TIN", () => {
    expect(stripTINDashes("123-456-789-000")).toBe("123456789000");
  });

  it("should handle TIN without dashes", () => {
    expect(stripTINDashes("123456789000")).toBe("123456789000");
  });
});

describe("parseTIN", () => {
  it("should parse 12-digit TIN correctly", () => {
    const info = parseTIN("123-456-789-000");
    expect(info.valid).toBe(true);
    expect(info.rdoCode).toBe("123");
    expect(info.registrationType).toBe("456");
    expect(info.serialNumber).toBe("789");
    expect(info.branchCode).toBe("000");
    expect(info.formatted).toBe("123-456-789-000");
    expect(info.digits).toHaveLength(12);
    expect(info.message).toBe("");
  });

  it("should parse 15-digit TIN correctly", () => {
    const info = parseTIN("123-456-789-000-123");
    expect(info.valid).toBe(true);
    expect(info.rdoCode).toBe("123");
    expect(info.formatted).toBe("123-456-789-000-123");
  });

  it("should throw on empty input", () => {
    expect(() => parseTIN("")).toThrow("TIN cannot be empty");
  });

  it("should throw on invalid TIN", () => {
    expect(() => parseTIN("12345")).toThrow("Invalid TIN");
  });
});

describe("getTINRDOCode", () => {
  it("should extract RDO code", () => {
    expect(getTINRDOCode("123-456-789-000")).toBe("123");
    expect(getTINRDOCode("456-789-012-345")).toBe("456");
  });

  it("should return null for invalid TIN", () => {
    expect(getTINRDOCode("")).toBeNull();
    expect(getTINRDOCode("12345")).toBeNull();
  });
});

describe("getTINBranchCode", () => {
  it("should extract branch code", () => {
    expect(getTINBranchCode("123-456-789-000")).toBe("000");
    expect(getTINBranchCode("123-456-789-001")).toBe("001");
  });

  it("should return null for invalid TIN", () => {
    expect(getTINBranchCode("")).toBeNull();
  });
});

describe("isMainBranchTIN", () => {
  it("should return true for main branch", () => {
    expect(isMainBranchTIN("123-456-789-000")).toBe(true);
  });

  it("should return false for branch", () => {
    expect(isMainBranchTIN("123-456-789-001")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isMainBranchTIN("")).toBe(false);
  });
});

describe("isExtendedTIN", () => {
  it("should return true for 15-digit TIN", () => {
    expect(isExtendedTIN("123456789000123")).toBe(true);
  });

  it("should return false for 12-digit TIN", () => {
    expect(isExtendedTIN("123456789000")).toBe(false);
  });
});

describe("createTIN", () => {
  it("should create formatted TIN from components", () => {
    expect(createTIN("123", "456", "789", "000")).toBe("123-456-789-000");
  });

  it("should use default branch code 000", () => {
    expect(createTIN("123", "456", "789")).toBe("123-456-789-000");
  });

  it("should pad components with zeros", () => {
    expect(createTIN("1", "2", "3", "4")).toBe("001-002-003-004");
  });

  it("should throw on invalid component length", () => {
    expect(() => createTIN("1234", "456", "789")).toThrow();
  });
});
