import QRCode from "qrcode";

export interface QRCodeOptions {
  foregroundColor?: string;
  backgroundColor?: string;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  width?: number;
}

/**
 * Generate an SVG string representation of a QR code.
 */
export async function generateQrSvg(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    foregroundColor = "#000000",
    backgroundColor = "#ffffff",
    margin = 2,
    errorCorrectionLevel = "M",
    width = 256,
  } = options;

  return QRCode.toString(text, {
    type: "svg",
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
    margin,
    errorCorrectionLevel,
    width,
  });
}

/**
 * Generate a PNG Data URL of a QR code.
 */
export async function generateQrDataUrl(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    foregroundColor = "#000000",
    backgroundColor = "#ffffff",
    margin = 2,
    errorCorrectionLevel = "M",
    width = 512,
  } = options;

  return QRCode.toDataURL(text, {
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
    margin,
    errorCorrectionLevel,
    width,
  });
}

/**
 * Sanitize a string into a clean URL-friendly slug.
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Validate a slug string format.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 2 || slug.length > 64) {
    return false;
  }
  return /^[a-z0-9][a-z0-9-_]*[a-z0-9]$/.test(slug) || /^[a-z0-9]{2,}$/.test(slug);
}

/**
 * Validate a destination URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Construct full redirect URL for a slug.
 */
export function buildRedirectUrl(slug: string, baseUrl?: string): string {
  const base =
    baseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://scanflow.io";
  return `${base.replace(/\/+$/, "")}/r/${slug}`;
}
