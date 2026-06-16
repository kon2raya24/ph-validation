import {
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
} from "../phone";

describe("validatePHPhone", () => {
  describe("valid mobile numbers", () => {
    it("should validate local format (09XX)", () => {
      expect(validatePHPhone("09171234567")).toBe(true);
      expect(validatePHPhone("09181234567")).toBe(true);
      expect(validatePHPhone("09121234567")).toBe(true);
      expect(validatePHPhone("09911234567")).toBe(true);
      expect(validatePHPhone("09051234567")).toBe(true);
      expect(validatePHPhone("09381234567")).toBe(true);
    });

    it("should validate E.164 format (+63)", () => {
      expect(validatePHPhone("+639171234567")).toBe(true);
      expect(validatePHPhone("+639181234567")).toBe(true);
      expect(validatePHPhone("+639911234567")).toBe(true);
    });

    it("should validate without + (63)", () => {
      expect(validatePHPhone("639171234567")).toBe(true);
      expect(validatePHPhone("639181234567")).toBe(true);
    });

    it("should validate subscriber format (9XX)", () => {
      expect(validatePHPhone("9171234567")).toBe(true);
      expect(validatePHPhone("9181234567")).toBe(true);
    });
  });

  describe("valid landline numbers", () => {
    it("should validate Metro Manila landline (02)", () => {
      expect(validatePHPhone("0281234567")).toBe(true);
      expect(validatePHPhone("021234567")).toBe(true);
      expect(validatePHPhone("02-8123-4567")).toBe(true);
    });

    it("should validate provincial landlines", () => {
      expect(validatePHPhone("0321234567")).toBe(true); // Cebu
      expect(validatePHPhone("0821234567")).toBe(true); // Davao
      expect(validatePHPhone("0451234567")).toBe(true); // Angeles
    });
  });

  describe("invalid numbers", () => {
    it("should reject empty strings", () => {
      expect(validatePHPhone("")).toBe(false);
    });

    it("should reject too short numbers", () => {
      expect(validatePHPhone("0917123")).toBe(false);
      expect(validatePHPhone("12345")).toBe(false);
    });

    it("should reject non-numeric strings", () => {
      expect(validatePHPhone("abcdefghij")).toBe(false);
    });

    it("should reject numbers not starting with 0 or 63", () => {
      expect(validatePHPhone("123456789012")).toBe(false);
    });

    it("should reject mobile numbers with wrong prefix", () => {
      expect(validatePHPhone("0917123456")).toBe(false); // 9 digits after 09
      expect(validatePHPhone("091712345678")).toBe(false); // 11 digits after 09
    });
  });

  describe("with formatting characters", () => {
    it("should handle spaces", () => {
      expect(validatePHPhone("0917 123 4567")).toBe(true);
      expect(validatePHPhone("+63 917 123 4567")).toBe(true);
    });

    it("should handle dashes", () => {
      expect(validatePHPhone("0917-123-4567")).toBe(true);
    });

    it("should handle parentheses", () => {
      expect(validatePHPhone("(0917) 123 4567")).toBe(true);
    });
  });
});

describe("formatPHPhone", () => {
  it("should format local mobile to E.164", () => {
    expect(formatPHPhone("09171234567")).toBe("+639171234567");
  });

  it("should format subscriber to E.164", () => {
    expect(formatPHPhone("9171234567")).toBe("+639171234567");
  });

  it("should handle already formatted numbers", () => {
    expect(formatPHPhone("+639171234567")).toBe("+639171234567");
  });

  it("should handle 63 prefix", () => {
    expect(formatPHPhone("639171234567")).toBe("+639171234567");
  });

  it("should throw on empty input", () => {
    expect(() => formatPHPhone("")).toThrow("Phone number cannot be empty");
  });
});

describe("formatPHPhoneStyle", () => {
  it("should format to E.164", () => {
    expect(formatPHPhoneStyle("09171234567", "e164")).toBe("+639171234567");
  });

  it("should format to local with spaces", () => {
    expect(formatPHPhoneStyle("09171234567", "local")).toBe("0917 123 4567");
  });

  it("should format to dashed", () => {
    expect(formatPHPhoneStyle("09171234567", "dashed")).toBe("0917-123-4567");
  });

  it("should format to spaced E.164", () => {
    expect(formatPHPhoneStyle("09171234567", "spaced")).toBe("+63 917 123 4567");
  });

  it("should format landline to landline format", () => {
    expect(formatPHPhoneStyle("0281234567", "landline")).toBe("(02) 8123-4567");
  });
});

describe("detectCarrier", () => {
  it("should detect Globe", () => {
    expect(detectCarrier("09171234567")).toBe("Globe");
    expect(detectCarrier("09051234567")).toBe("Globe");
    expect(detectCarrier("09351234567")).toBe("Globe");
  });

  it("should detect Smart", () => {
    expect(detectCarrier("09181234567")).toBe("Smart");
    expect(detectCarrier("09081234567")).toBe("Smart");
    expect(detectCarrier("09201234567")).toBe("Smart");
  });

  it("should detect DITO", () => {
    expect(detectCarrier("09911234567")).toBe("DITO");
    expect(detectCarrier("09921234567")).toBe("DITO");
    expect(detectCarrier("09931234567")).toBe("DITO");
  });

  it("should detect TNT", () => {
    expect(detectCarrier("09071234567")).toBe("TNT");
    expect(detectCarrier("09091234567")).toBe("TNT");
    expect(detectCarrier("09301234567")).toBe("TNT");
  });

  it("should detect TM", () => {
    expect(detectCarrier("09031234567")).toBe("TM");
    expect(detectCarrier("09321234567")).toBe("TM");
  });

  it("should detect Sun", () => {
    expect(detectCarrier("09231234567")).toBe("Sun");
    expect(detectCarrier("09241234567")).toBe("Sun");
  });

  it("should return Unknown for invalid", () => {
    expect(detectCarrier("")).toBe("Unknown");
    expect(detectCarrier("12345")).toBe("Unknown");
  });
});

describe("getPhoneType", () => {
  it("should detect mobile", () => {
    expect(getPhoneType("09171234567")).toBe("mobile");
    expect(getPhoneType("+639171234567")).toBe("mobile");
  });

  it("should detect landline", () => {
    expect(getPhoneType("0281234567")).toBe("landline");
    expect(getPhoneType("0321234567")).toBe("landline");
  });

  it("should return unknown for empty", () => {
    expect(getPhoneType("")).toBe("unknown");
  });
});

describe("getPhoneInfo", () => {
  it("should return detailed info for valid mobile", () => {
    const info = getPhoneInfo("09171234567");
    expect(info.valid).toBe(true);
    expect(info.formatted).toBe("+639171234567");
    expect(info.type).toBe("mobile");
    expect(info.carrier).toBe("Globe");
    expect(info.areaCode).toBeNull();
    expect(info.message).toBe("");
  });

  it("should return detailed info for valid landline", () => {
    const info = getPhoneInfo("0281234567");
    expect(info.valid).toBe(true);
    expect(info.type).toBe("landline");
    expect(info.areaCode).toBe("02");
    expect(info.carrier).toBeNull();
  });

  it("should return invalid for empty", () => {
    const info = getPhoneInfo("");
    expect(info.valid).toBe(false);
    expect(info.message).not.toBe("");
  });
});

describe("isMobile", () => {
  it("should return true for mobile numbers", () => {
    expect(isMobile("09171234567")).toBe(true);
    expect(isMobile("+639181234567")).toBe(true);
  });

  it("should return false for landlines", () => {
    expect(isMobile("0281234567")).toBe(false);
  });

  it("should return false for invalid", () => {
    expect(isMobile("")).toBe(false);
  });
});

describe("isLandline", () => {
  it("should return true for landlines", () => {
    expect(isLandline("0281234567")).toBe(true);
    expect(isLandline("0321234567")).toBe(true);
  });

  it("should return false for mobile", () => {
    expect(isLandline("09171234567")).toBe(false);
  });
});

describe("normalizePHPhone", () => {
  it("should normalize +63 format to local", () => {
    expect(normalizePHPhone("+639171234567")).toBe("09171234567");
  });

  it("should normalize 63 prefix to local", () => {
    expect(normalizePHPhone("639171234567")).toBe("09171234567");
  });

  it("should keep local format", () => {
    expect(normalizePHPhone("09171234567")).toBe("09171234567");
  });

  it("should return empty for invalid", () => {
    expect(normalizePHPhone("")).toBe("");
    expect(normalizePHPhone("12345")).toBe("");
  });
});

describe("getMobilePrefixes", () => {
  it("should return prefixes grouped by carrier", () => {
    const prefixes = getMobilePrefixes();
    expect(prefixes.Globe).toBeDefined();
    expect(prefixes.Smart).toBeDefined();
    expect(prefixes.DITO).toBeDefined();
    expect(prefixes.TNT).toBeDefined();
    expect(Array.isArray(prefixes.Globe)).toBe(true);
  });
});
