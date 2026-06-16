export function validateSSS(sss: string): boolean {
  return /^\d{10}$/.test(sss.replace(/[^0-9]/g, ""));
}
