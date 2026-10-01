import { site } from '@/config/site';
import { teamHref, type TeamMember } from '@/config/team';

/**
 * Shared JSON-LD types, ids, and helpers (SEO-SPEC §2). The entity builders live in
 * jsonld.ts and the page-level ones in jsonld-pages.ts; import all of them from
 * `@/lib/seo/jsonld`.
 */

export type JsonLdValue = string | number | boolean | JsonLdObject | JsonLdValue[];
export interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}

export const CONTEXT = 'https://schema.org';
export const ORG_ID = `${site.canonicalHost}/#org`;
export const WEBSITE_ID = `${site.canonicalHost}/#website`;

export function absoluteUrl(path: string): string {
  return `${site.canonicalHost}${path}`;
}

export function personId(slug: string): string {
  return `${site.canonicalHost}/attorneys/${slug}/#person`;
}

/** Drops values still marked [CONFIRM] so unverified facts never reach markup. */
export function verified<T extends string>(values: readonly T[]): T[] {
  return values.filter((v) => !v.includes('[CONFIRM]'));
}

export function withContext(data: JsonLdObject): JsonLdObject {
  return { '@context': CONTEXT, ...data };
}

/**
 * A byline: the lawyer by `@id` (the full Person lives on the bio page) plus the
 * type, name, and URL Google asks for on every author (Article author guidelines).
 */
export function personRef(member: Pick<TeamMember, 'slug' | 'name'>): JsonLdObject {
  return {
    '@type': 'Person',
    '@id': personId(member.slug),
    name: member.name,
    url: absoluteUrl(teamHref(member)),
  };
}
