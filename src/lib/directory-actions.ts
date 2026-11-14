export function telephone(number?: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^0[1-5]\d{9}$/.test(digits)) return `+91${digits.slice(1)}`;
  if (/^[1-5]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^91[1-5]\d{9}$/.test(digits)) return `+${digits}`;
  return undefined;
}
export function whatsappUrl(number?: string) {
  const normalized = telephone(number);
  return normalized && /^\+91[6-9]\d{9}$/.test(normalized)
    ? `https://wa.me/${normalized.slice(1)}`
    : undefined;
}
export function directionsUrl(b: {
  name: string;
  address?: string;
  area: string;
  city: string;
  pincode?: string;
}) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([b.name, b.address, b.area, b.city, b.pincode].filter(Boolean).join(", "))}`;
}
export async function shareBusiness(title: string, url: string) {
  if (navigator.share) {
    await navigator.share({ title, url });
    return "shared";
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}
