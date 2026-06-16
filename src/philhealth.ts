export function validatePhilHealth(ph: string): boolean {
  return /^\d{12}$/.test(ph.replace(/[^0-9]/g, ""));
}
