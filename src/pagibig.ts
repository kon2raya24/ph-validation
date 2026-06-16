export function validatePagIBIG(id: string): boolean {
  return /^\d{12}$/.test(id.replace(/[^0-9]/g, ""));
}
