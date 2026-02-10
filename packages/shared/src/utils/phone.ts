export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneDisplay(phone: string, masked = false): string {
  if (masked) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `***${digits.slice(-4)}`;
    }
  }
  return phone;
}
