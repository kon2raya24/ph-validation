export function validatePHPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return /^(\+63|63|0)9\d{9}$/.test(cleaned);
}

export function formatPHPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("63")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+63${cleaned.slice(1)}`;
  return `+63${cleaned}`;
}
