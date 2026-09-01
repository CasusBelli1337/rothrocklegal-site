import type { Metadata } from "next";
import { site } from "@/config/site";

export interface PageMetadataInput {
  /** Page title. Appended with " | Rothrock Legal" unless `absoluteTitle`. */
  title: string;
  /** Use when the title already ends in the brand (SEO-SPEC §4). */
  absoluteTitle?: boolean;
  /** ≤ 155 characters. */
  description: string;
  /** Trailing-slash path, e.g. '/trust-contests/'. */
  path: string;
  /** Site-relative OG image (1200×630). Defaults to the site card. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  /** Article extras (openGraph.article). */
  article?: {
    publishedTime: string;
    modifiedTime: string;
    authors: string[];
    section: string;
    tags: readonly string[];
  };
}

/** Builds the Next `Metadata` for a page so every page calls one helper (SEO-SPEC §2). */
export function pageMetadata(input: PageMetadataInput): Metadata {
  if (input.description.length > 160) {
    throw new Error(
      `Meta description for ${input.path} is ${input.description.length} chars (max 160)`,
    );
  }
  const image = input.image ?? site.ogImage;
  const ogTitle = input.absoluteTitle
    ? input.title
    : `${input.title} | ${site.name}`;
  const metadata: Metadata = {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: ogTitle,
      description: input.description,
      url: input.path,
      siteName: site.name,
      locale: "en_US",
      type: input.type ?? "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.imageAlt ?? ogTitle,
        },
      ],
      ...(input.article ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: input.description,
      images: [image],
    },
  };
  if (input.noindex) metadata.robots = { index: false, follow: false };
  return metadata;
}
