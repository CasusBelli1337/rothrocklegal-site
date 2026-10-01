import { consultCta, site, social } from '@/config/site';
import { getPracticeArea, practiceAreas } from '@/config/practice-areas';
import { areaServed } from '@/config/service-areas';
import { credentialLabel, team, teamHref, type TeamMember } from '@/config/team';
import {
  CONTEXT,
  ORG_ID,
  WEBSITE_ID,
  absoluteUrl,
  personId,
  verified,
  withContext,
  type JsonLdObject,
} from './jsonld-core';

/**
 * Typed JSON-LD builders (SEO-SPEC.md §2–§3). Each returns a plain object;
 * pages render them through `<JsonLd data={...} />`. This file holds the site's
 * entities (the firm, the website, the lawyers); page-level builders live in
 * jsonld-pages.ts and the shared ids in jsonld-core.ts, both re-exported here.
 */

export * from './jsonld-core';
export * from './jsonld-pages';

/** What the firm handles: one topic per practice page, in nav order. */
export const KNOWS_ABOUT: readonly string[] = practiceAreas.map((a) => a.topic);

/** How to reach the firm: the consult request (no phone, Arthur does not field calls) or email. */
function contactPoint(): JsonLdObject {
  return {
    '@type': 'ContactPoint',
    contactType: 'new client consultations',
    email: site.email,
    url: absoluteUrl(consultCta.href),
  };
}

export function legalService(): JsonLdObject {
  return {
    '@type': 'LegalService',
    '@id': ORG_ID,
    name: site.name,
    url: `${site.canonicalHost}/`,
    logo: absoluteUrl('/images/logo-square.png'),
    image: [absoluteUrl(site.ogImage)],
    email: site.email,
    description: site.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.office.city,
      addressRegion: site.office.region,
      addressCountry: site.office.country,
    },
    areaServed: areaServed(),
    knowsAbout: [...KNOWS_ABOUT],
    contactPoint: contactPoint(),
    founder: { '@id': personId('arthur-rothrock') },
    employee: team.map((m) => ({ '@id': personId(m.slug) })),
    sameAs: [...social.firmProfiles],
  };
}

export function webSite(): JsonLdObject {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.name,
    url: `${site.canonicalHost}/`,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
  };
}

/** The root-layout graph: LegalService + WebSite. */
export function siteGraph(): JsonLdObject {
  return { '@context': CONTEXT, '@graph': [legalService(), webSite()] };
}

/** Memberships as Organizations, held offices as OrganizationRoles (schema.org Role pattern). */
function memberOf(member: TeamMember): JsonLdObject[] {
  const organizations = verified(member.memberships).map((name) => ({
    '@type': 'Organization',
    name,
  }));
  const roles = member.leadership
    .filter((r) => verified([r.role, r.organization]).length === 2)
    .map((r) => ({
      '@type': 'OrganizationRole',
      roleName: r.role,
      memberOf: { '@type': 'Organization', name: r.organization },
    }));
  return [...organizations, ...roles];
}

/** The topics of the practice pages this lawyer's bio links to; the firm's list when none. */
export function memberKnowsAbout(member: Pick<TeamMember, 'practices'>): string[] {
  const topics = member.practices.map((slug) => getPracticeArea(slug).topic);
  return topics.length > 0 ? topics : [...KNOWS_ABOUT];
}

export function person(member: TeamMember): JsonLdObject {
  const licensed = Boolean(member.barNumber);
  return {
    '@type': 'Person',
    '@id': personId(member.slug),
    name: member.name,
    honorificSuffix: licensed ? 'Esq.' : undefined,
    jobTitle: verified([member.title])[0],
    worksFor: { '@id': ORG_ID },
    image: absoluteUrl(member.image.large),
    url: absoluteUrl(teamHref(member)),
    description: verified([member.summary])[0],
    alumniOf: verified(member.education.map((e) => e.school)).map((name) => ({
      '@type': 'EducationalOrganization',
      name,
    })),
    memberOf: memberOf(member),
    award: verified(member.credentials.map(credentialLabel)),
    hasCredential: licensed
      ? [
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'Attorney admission',
            recognizedBy: {
              '@type': 'Organization',
              name: 'State Bar of California',
            },
            name: `State Bar of California #${member.barNumber}`,
          },
        ]
      : undefined,
    knowsAbout: memberKnowsAbout(member),
    sameAs: verified(member.sameAs),
  };
}

export function profilePage(member: TeamMember): JsonLdObject {
  return withContext({
    '@type': 'ProfilePage',
    dateModified: member.updatedAt,
    mainEntity: person(member),
  });
}
