import { lensConfig } from '@/config/lens';
import type { LensEffect } from './types';

/** Pure signal rules over src/config/lens.ts: what a path or a click is worth. */

/** Half weight, rounded toward zero, never below ±1: navigating somewhere counts less than landing there. */
export function navigationWeight(weight: number): number {
  const half = Math.trunc(weight / 2);
  return half === 0 ? Math.sign(weight) : half;
}

/** '/for-trustees' or '/for-trustees/?x#y' → '/for-trustees/'. */
export function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] || '/';
  return clean.endsWith('/') ? clean : `${clean}/`;
}

const ARTICLE = /^\/library\/([^/]+)\/$/;

/** Landing weight of a path; 0 on neutral ground. Articles come from the slug → weight map. */
export function pathWeight(
  pathname: string,
  articleWeights: Readonly<Record<string, number>> = {},
): number {
  const path = normalizePath(pathname);
  const article = ARTICLE.exec(path);
  if (article) return articleWeights[article[1]] ?? 0;
  return lensConfig.pathWeights[path] ?? 0;
}

export function signalForPath(
  pathname: string,
  isLanding: boolean,
  articleWeights: Readonly<Record<string, number>> = {},
): LensEffect | null {
  const weight = pathWeight(pathname, articleWeights);
  if (weight === 0) return null;
  return { key: normalizePath(pathname), weight: isLanding ? weight : navigationWeight(weight) };
}

/** 'card:for-trustees', 'chip:trust-contests', 'switch:beneficiary', ... → effect, or null when it says nothing. */
export function signalForEvent(eventKey: string): LensEffect | null {
  const rule = lensConfig.events.find((r) => eventKey.startsWith(r.prefix));
  if (!rule) return null;
  const rest = eventKey.slice(rule.prefix.length);
  if (rule.set) {
    return Object.hasOwn(rule.set, rest) ? { key: eventKey, set: rule.set[rest] } : null;
  }
  const weight = rule.exact?.[rest] ?? rule.otherwise ?? 0;
  return weight === 0 ? null : { key: eventKey, weight };
}
