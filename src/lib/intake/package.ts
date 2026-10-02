import type { PackageResponse } from './contract';
import { PACKAGE_COPY } from './copy';
import { formatBytes } from './document-slots';

/** A `ready` answer with everything the card needs; anything less shows nothing. */
export interface ReadyPackage {
  /** One use, until `urlExpiresAt`; the card asks for a fresh one after a click. */
  url: string;
  urlExpiresAt: string;
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
    urlExpiresAt: response.urlExpiresAt ?? '',
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

/** The plain lines under the download button: size and documents, the last day, one use, confidential. */
export function packageDetails(pkg: ReadyPackage, timeZone?: string): string[] {
  const date = expiryDate(pkg.expiresAt, timeZone);
  const lines: string[] = [];
  if (pkg.sizeBytes > 0)
    lines.push(PACKAGE_COPY.contents(formatBytes(pkg.sizeBytes), pkg.fileCount));
  if (date) lines.push(PACKAGE_COPY.expires(date));
  lines.push(PACKAGE_COPY.oneUse, PACKAGE_COPY.confidential);
  return lines;
}

/**
 * The download: a form POST to the one-use link (a GET only opens a page on
 * the intake server), from a hidden form of its own, because the done screen
 * already sits inside the step's form and forms cannot nest. `submit()` fires
 * no submit event, so no other form reacts. The browser saves the zip and the
 * page stays where it is.
 */
export function submitDownload(url: string, doc: Document = document): void {
  const form = doc.createElement('form');
  form.method = 'post';
  form.action = url;
  form.hidden = true;
  doc.body.appendChild(form);
  form.submit();
  setTimeout(() => form.remove(), 1000);
}
