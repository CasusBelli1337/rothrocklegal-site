import { describe, expect, it } from 'vitest';
import { formatBytes } from './document-slots';
import { expiryDate, packageDetails, readyPackage, type ReadyPackage } from './package';

const LA = 'America/Los_Angeles';

const pkg = (over: Partial<ReadyPackage> = {}): ReadyPackage => ({
  url: 'https://intake.example/package/abc.zip',
  expiresAt: '2026-10-15T19:00:00.000Z',
  sizeBytes: 13_002_342,
  fileCount: 9,
  ...over,
});

describe('expiryDate', () => {
  it('reads an ISO instant as an American date on the given clock', () => {
    expect(expiryDate('2026-10-15T19:00:00.000Z', LA)).toBe('October 15, 2026');
  });

  it('uses the reader’s calendar day, not the UTC one', () => {
    // 3 a.m. UTC on the 15th is still the evening of the 14th in California.
    expect(expiryDate('2026-10-15T03:00:00Z', LA)).toBe('October 14, 2026');
    expect(expiryDate('2026-10-15T03:00:00Z', 'UTC')).toBe('October 15, 2026');
  });

  it('is null for a missing or unreadable date', () => {
    expect(expiryDate('', LA)).toBeNull();
    expect(expiryDate('soon', LA)).toBeNull();
  });
});

describe('formatBytes for a package', () => {
  it('uses plain units up to gigabytes', () => {
    expect(formatBytes(48 * 1024)).toBe('48 KB');
    expect(formatBytes(13_002_342)).toBe('12.4 MB');
    expect(formatBytes(1.5 * 1024 ** 3)).toBe('1.5 GB');
  });
});

describe('packageDetails', () => {
  it('says the size, the documents, the expiry, and the email in plain words', () => {
    expect(packageDetails(pkg(), LA)).toEqual([
      'One zip file, 12.4 MB, with the 9 documents you uploaded.',
      'The link works until October 15, 2026.',
      'We also email you this link.',
    ]);
  });

  it('counts one document and no documents without awkward plurals', () => {
    expect(packageDetails(pkg({ fileCount: 1 }), LA)[0]).toBe(
      'One zip file, 12.4 MB, with the document you uploaded.',
    );
    expect(packageDetails(pkg({ fileCount: 0, sizeBytes: 48 * 1024 }), LA)[0]).toBe(
      'One zip file, 48 KB.',
    );
  });

  it('leaves out a line the server gave no number for', () => {
    expect(packageDetails(pkg({ sizeBytes: 0, expiresAt: '' }), LA)).toEqual([
      'We also email you this link.',
    ]);
  });
});

describe('readyPackage', () => {
  const ready = {
    status: 'ready' as const,
    url: 'https://intake.example/package/abc.zip',
    expiresAt: '2026-10-15T19:00:00.000Z',
    sizeBytes: 100,
    fileCount: 2,
  };

  it('passes a complete ready answer through', () => {
    expect(readyPackage(ready)).toEqual({
      url: ready.url,
      expiresAt: ready.expiresAt,
      sizeBytes: 100,
      fileCount: 2,
    });
  });

  it('is null unless the answer is ready with an absolute http(s) link', () => {
    expect(readyPackage({ status: 'preparing' })).toBeNull();
    expect(readyPackage({ status: 'unavailable' })).toBeNull();
    expect(readyPackage({ ...ready, url: undefined })).toBeNull();
    expect(readyPackage({ ...ready, url: '/package/abc.zip' })).toBeNull();
    expect(readyPackage({ ...ready, url: 'javascript:alert(1)' })).toBeNull();
  });

  it('fills missing numbers with zero so the card simply leaves them out', () => {
    expect(readyPackage({ status: 'ready', url: ready.url })).toEqual({
      url: ready.url,
      expiresAt: '',
      sizeBytes: 0,
      fileCount: 0,
    });
  });
});
