import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PrivacyCookies } from '@/components/legal/PrivacyCookies';
import { collectStrings, voiceViolations } from '@/lib/voice-guide';
import {
  consentCategoryCopy,
  consentCopy,
  policyAdvertising,
  policyAdvertisingCopy,
  privacyChoicesLabel,
  privacyChoicesLabels,
} from './consent-copy';

/** Every string the bar, the footer link, and the policy can print, templates filled in. */
function allLines(): string[] {
  return [
    ...collectStrings([
      consentCopy,
      consentCategoryCopy,
      privacyChoicesLabels,
      policyAdvertisingCopy,
    ]),
    consentCopy.changeLater(privacyChoicesLabel()),
    consentCopy.changeLater(privacyChoicesLabels.withAdvertising),
    consentCopy.signalNote(consentCopy.signalNames.gpc),
    consentCopy.signalNote(consentCopy.signalNames.dnt),
    policyAdvertisingCopy.withAdvertising('Meta'),
  ];
}

/** Text of the privacy policy's new section, as rendered. */
function cookiesSectionText(): string {
  return renderToStaticMarkup(<PrivacyCookies />)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, "'")
    .replace(/\s+/g, ' ');
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 0);
}

describe('consent copy hygiene', () => {
  const lines = allLines();

  it('has copy to check', () => {
    expect(lines.length).toBeGreaterThan(20);
  });

  it('uses no em dashes', () => {
    expect([...lines, cookiesSectionText()].filter((l) => l.includes('\u2014'))).toEqual([]);
  });

  it('uses none of the voice guide blacklist', () => {
    expect(voiceViolations([...lines, cookiesSectionText()])).toEqual([]);
  });

  it('keeps every sentence under about 25 words', () => {
    const long = [...lines, cookiesSectionText()]
      .flatMap(sentences)
      .filter((s) => s.split(/\s+/).length > 26);
    expect(long).toEqual([]);
  });

  it('avoids legalese', () => {
    const legalese = /\b(hereby|herein|pursuant|whereas|notwithstanding|aforementioned|thereof)\b/i;
    expect(lines.filter((l) => legalese.test(l))).toEqual([]);
  });

  it('names the three choices exactly as asked', () => {
    expect([consentCopy.accept, consentCopy.decline, consentCopy.choose]).toEqual([
      'Accept analytics',
      'Decline',
      'Choose',
    ]);
  });
});

describe('today, with no advertising vendor', () => {
  it('calls the footer link "Privacy choices"', () => {
    expect(privacyChoicesLabel()).toBe('Privacy choices');
  });

  it('tells the policy reader no advertising cookies run', () => {
    expect(policyAdvertising().full).toBe(policyAdvertisingCopy.none);
    expect(cookiesSectionText()).toContain('No advertising cookies or social-media pixels run');
  });
});
