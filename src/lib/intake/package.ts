import type { PackageResponse } from './contract';
import { PACKAGE_COPY } from './copy';
import { formatBytes } from './document-slots';

/** A `ready` answer with everything the card needs; anything less shows nothing. */
export interface ReadyPackage {
  url: string;
  expiresAt: string;
  sizeBytes: number;
  fileCount: number;
}

/** Only an absolute http(s) link becomes a download button. */
function isDownloadUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

export function readyPackage(response: PackageResponse): ReadyPackage | null {
  if (response.status !== 'ready' || !isDownloadUrl(response.url)) return null;
  return {
    url: response.url,
    expiresAt: response.expiresAt ?? '',
    sizeBytes: Math.max(0, response.sizeBytes ?? 0),
    fileCount: Math.max(0, response.fileCount ?? 0),
  };
}

/**
 * "October 15, 2026" on the reader's own clock (the instant the link stops
 * working can fall on a different calendar day in California than in UTC).
 * Null when the server sent no usable date, so the line is left out.
 */
export function expiryDate(iso: string, timeZone?: string): string | null {
  const when = new Date(iso);
  if (!iso || Number.isNaN(when.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(when);
}

/** The plain lines under the download button: size and documents, expiry, the email. */
export function packageDetails(pkg: ReadyPackage, timeZone?: string): string[] {
  const date = expiryDate(pkg.expiresAt, timeZone);
  const lines: string[] = [];
  if (pkg.sizeBytes > 0)
    lines.push(PACKAGE_COPY.contents(formatBytes(pkg.sizeBytes), pkg.fileCount));
  if (date) lines.push(PACKAGE_COPY.expires(date));
  lines.push(PACKAGE_COPY.emailed);
  return lines;
}
