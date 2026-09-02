import { areaServed } from "@/config/service-areas";
import { site, social } from "@/config/site";
import {
  credentialLabel,
  team,
  teamHref,
  type TeamMember,
} from "@/config/team";
import type { Crumb, FaqItem } from "@/types/content";

/**
 * Typed JSON-LD builders (SEO-SPEC.md §2–§3). Each returns a plain object;
 * pages render them through `<JsonLd data={...} />`.
 */

export type JsonLdValue =
  string | number | boolean | JsonLdObject | JsonLdValue[];
export interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}

const CONTEXT = "https://schema.org";
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
  return values.filter((v) => !v.includes("[CONFIRM]"));
}

function withContext(data: JsonLdObject): JsonLdObject {
  return { "@context": CONTEXT, ...data };
}

export const KNOWS_ABOUT = [
  "trust litigation",
  "will contests",
  "undue influence",
  "breach of fiduciary duty",
  "trust accountings",
  "Probate Code section 850 petitions",
  "financial elder abuse",
  "trustee defense",
  "complex and high-value estate litigation",
];

export function legalService(): JsonLdObject {
  return {
    "@type": "LegalService",
    "@id": ORG_ID,
    name: site.name,
    url: `${site.canonicalHost}/`,
    logo: absoluteUrl("/images/logo-square.png"),
    image: [absoluteUrl(site.ogImage)],
    telephone: site.phoneE164,
    email: site.email,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.office.city,
      addressRegion: site.office.region,
      addressCountry: site.office.country,
    },
    areaServed: areaServed(),
    knowsAbout: KNOWS_ABOUT,
    founder: { "@id": personId("arthur-rothrock") },
    employee: team.map((m) => ({ "@id": personId(m.slug) })),
    sameAs: [...social.firmProfiles],
  };
}

export function webSite(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: `${site.canonicalHost}/`,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

/** The root-layout graph: LegalService + WebSite. */
export function siteGraph(): JsonLdObject {
  return { "@context": CONTEXT, "@graph": [legalService(), webSite()] };
}

/** Memberships as Organizations, held offices as OrganizationRoles (schema.org Role pattern). */
function memberOf(member: TeamMember): JsonLdObject[] {
  const organizations = verified(member.memberships).map((name) => ({
    "@type": "Organization",
    name,
  }));
  const roles = member.leadership
    .filter((r) => verified([r.role, r.organization]).length === 2)
    .map((r) => ({
      "@type": "OrganizationRole",
      roleName: r.role,
      memberOf: { "@type": "Organization", name: r.organization },
    }));
  return [...organizations, ...roles];
}

export function person(member: TeamMember): JsonLdObject {
  const licensed = Boolean(member.barNumber);
  return {
    "@type": "Person",
    "@id": personId(member.slug),
    name: member.name,
    honorificSuffix: licensed ? "Esq." : undefined,
    jobTitle: verified([member.title])[0],
    worksFor: { "@id": ORG_ID },
    image: absoluteUrl(member.image.large),
    url: absoluteUrl(teamHref(member)),
    description: verified([member.summary])[0],
    alumniOf: verified(member.education.map((e) => e.school)).map((name) => ({
      "@type": "EducationalOrganization",
      name,
    })),
    memberOf: memberOf(member),
    award: verified(member.credentials.map(credentialLabel)),
    hasCredential: licensed
      ? [
          {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "Attorney admission",
            recognizedBy: {
              "@type": "Organization",
              name: "State Bar of California",
            },
            name: `State Bar of California #${member.barNumber}`,
          },
        ]
      : undefined,
    knowsAbout: KNOWS_ABOUT,
    sameAs: verified(member.sameAs),
  };
}

export function profilePage(member: TeamMember): JsonLdObject {
  return withContext({
    "@type": "ProfilePage",
    dateModified: member.updatedAt,
    mainEntity: person(member),
  });
}

export interface ArticleInput {
  slug: string;
  title: string;
  description: string;
  /** Site-relative 16:9 image path, if any. */
  image?: string;
  /** ISO dates. */
  date: string;
  updated: string;
  authorSlug: string;
  authorName: string;
  category: string;
  tags: readonly string[];
  /** BlogPosting for the legacy Technology & the Law posts (SEO-SPEC §3d). */
  legacy?: boolean;
}

export function article(input: ArticleInput): JsonLdObject {
  const url = absoluteUrl(`/library/${input.slug}/`);
  const images = [absoluteUrl(site.ogImage)];
  if (input.image) images.push(absoluteUrl(input.image));
  return withContext({
    "@type": input.legacy ? "BlogPosting" : "Article",
    "@id": `${url}#article`,
    headline: input.title.slice(0, 110),
    description: input.description,
    image: images,
    datePublished: `${input.date}T00:00:00-07:00`,
    dateModified: `${input.updated}T00:00:00-07:00`,
    author: {
      "@id": personId(input.authorSlug),
      name: input.authorName,
      url: absoluteUrl(`/attorneys/${input.authorSlug}/`),
    },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: [{ "@type": "Thing", name: input.category }],
    keywords: input.tags.join(", "),
    inLanguage: "en-US",
    isAccessibleForFree: true,
  });
}

export function faqPage(items: readonly FaqItem[]): JsonLdObject {
  return withContext({
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}

/** Trail per IA.md §6; the last crumb has no href. */
export function breadcrumbList(trail: readonly Crumb[]): JsonLdObject {
  return withContext({
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: crumb.href ? absoluteUrl(crumb.href) : undefined,
    })),
  });
}

export function webPage(input: {
  path: string;
  title: string;
  description: string;
  updated?: string;
}): JsonLdObject {
  return withContext({
    "@type": "WebPage",
    "@id": absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    name: input.title,
    description: input.description,
    dateModified: input.updated,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en-US",
  });
}
