import { describe, expect, it } from 'vitest';
import { detectBrowser } from './browser';

const UA = {
  chromeWin:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  chromeMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  edgeWin:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.42',
  edgeAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 EdgA/128.0.2739.42',
  safariMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  firefoxWin: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
  firefoxAndroid: 'Mozilla/5.0 (Android 14; Mobile; rv:129.0) Gecko/129.0 Firefox/129.0',
  safariIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  safariIpadOld:
    'Mozilla/5.0 (iPad; CPU OS 12_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
  chromeIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0.6613.98 Mobile/15E148 Safari/604.1',
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  chromeAndroidTablet:
    'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  samsung:
    'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
};

describe('detectBrowser', () => {
  it('tells the desktop browsers apart', () => {
    expect(detectBrowser(UA.chromeWin)).toEqual({ kind: 'chrome-desktop', device: 'desktop' });
    expect(detectBrowser(UA.chromeMac).kind).toBe('chrome-desktop');
    expect(detectBrowser(UA.edgeWin).kind).toBe('edge');
    expect(detectBrowser(UA.safariMac)).toEqual({ kind: 'safari-mac', device: 'desktop' });
    expect(detectBrowser(UA.firefoxWin).kind).toBe('firefox');
  });

  it('tells the phone browsers apart', () => {
    expect(detectBrowser(UA.safariIphone)).toEqual({ kind: 'safari-ios', device: 'phone' });
    expect(detectBrowser(UA.chromeAndroid)).toEqual({ kind: 'chrome-android', device: 'phone' });
    expect(detectBrowser(UA.samsung)).toEqual({ kind: 'samsung', device: 'phone' });
    expect(detectBrowser(UA.edgeAndroid)).toEqual({ kind: 'edge', device: 'phone' });
    expect(detectBrowser(UA.firefoxAndroid)).toEqual({ kind: 'firefox', device: 'phone' });
  });

  it('treats an iPad as a tablet, including one that claims to be a Mac', () => {
    expect(detectBrowser(UA.safariIpadOld)).toEqual({ kind: 'safari-ios', device: 'tablet' });
    expect(detectBrowser(UA.safariMac, { maxTouchPoints: 5 })).toEqual({
      kind: 'safari-ios',
      device: 'tablet',
    });
    expect(detectBrowser(UA.safariMac, { maxTouchPoints: 0 }).kind).toBe('safari-mac');
    expect(detectBrowser(UA.chromeAndroidTablet).device).toBe('tablet');
  });

  it('gives non-Safari browsers on an iPhone the generic steps', () => {
    expect(detectBrowser(UA.chromeIphone)).toEqual({ kind: 'unknown', device: 'phone' });
  });

  it('falls back to unknown on anything else', () => {
    expect(detectBrowser('')).toEqual({ kind: 'unknown', device: 'desktop' });
    expect(detectBrowser('Lynx/2.8.9rel.1 libwww-FM/2.14').kind).toBe('unknown');
  });
});
