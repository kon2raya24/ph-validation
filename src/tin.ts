export function validateTIN(tin: string): boolean {
  const cleaned = tin.replace(/[^0-9]/g, "");
  return /^\d{12,15}$/.test(cleaned);
}

export function formatTIN(tin: string): string {
  const cleaned = tin.replace(/[^0-9]/g, "");
  if (cleaned.length === 12) {
    return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6,9)}-${cleaned.slice(9)}`;
  }
  return cleaned;
}
