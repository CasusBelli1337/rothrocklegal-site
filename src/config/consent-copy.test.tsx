import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PrivacyCollect } from '@/components/legal/PrivacyCollect';
import { PrivacyCookies } from '@/components/legal/PrivacyCookies';
import { PrivacyRights } from '@/components/legal/PrivacyRights';
import { collectStrings, voiceViolations } from '@/lib/voice-guide';
import {
  consentCategoryCopy,
  consentCopy,
  counterCopy,
  policyAdvertising,
  policyCounter,
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
      counterCopy,
    ]),
    consentCopy.changeLater(privacyChoicesLabel()),
    consentCopy.changeLater(privacyChoicesLabels.withAdvertising),
    consentCopy.signalNote(consentCopy.signalNames.gpc),
    consentCopy.signalNote(consentCopy.signalNames.dnt),
    policyAdvertisingCopy.withAdvertising('Meta'),
  ];
}

/** Text of a privacy policy section, as rendered. */
function textOf(section: React.ReactElement): string {
  return renderToStaticMarkup(section)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, "'")
    .replace(/\s+/g, ' ');
}

function cookiesSectionText(): string {
  return textOf(<PrivacyCookies />);
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

describe("the firm's own visit counter, while site.counter is filled in", () => {
  it('is described in the policy: technical details, cookies, and both signal paragraphs', () => {
    expect(policyCounter()).toBe(counterCopy);
    expect(textOf(<PrivacyCollect />)).toContain(counterCopy.technical);
    expect(cookiesSectionText()).toContain(counterCopy.cookies);
    expect(cookiesSectionText()).toContain(counterCopy.signal);
    expect(textOf(<PrivacyRights />)).toContain(counterCopy.signal);
  });

  it('promises what the counter does: no cookie, nothing kept on the device, signals honored', () => {
    expect(counterCopy.technical).toMatch(/no cookie/);
    expect(counterCopy.technical).toMatch(/saves nothing on your device/);
    expect(counterCopy.technical).toMatch(/never stored/);
    expect(counterCopy.technical).toMatch(/Do Not Track or Global Privacy Control/);
    expect(counterCopy.barNote).toMatch(/unless your browser sends a privacy signal/);
  });
});
