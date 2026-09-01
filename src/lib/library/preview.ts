import fs from "node:fs";
import path from "node:path";
import { parseBool, parseFrontmatter, requireKey } from "@/lib/frontmatter";
import {
  categorySlug,
  isLibraryCategory,
  type LibraryCategory,
} from "@/types/content";

/**
 * Lightweight library reader for previews (homepage "From the library",
 * practice-page "related reading"). Frontmatter only, no body rendering.
 * The library builder owns the full loader; keep this one small.
 */

export interface LibraryPreviewItem {
  slug: string;
  title: string;
  excerpt: string;
  category: LibraryCategory;
  categorySlug: string;
  date: string;
  updated: string;
  image?: string;
  imageAlt?: string;
  draft: boolean;
  /** Minutes, words / 200, min 1. */
  readingTime: number;
}

const LIBRARY_DIR = path.join(process.cwd(), "content", "library");

function loadItem(fileName: string): LibraryPreviewItem {
  const slug = fileName.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(LIBRARY_DIR, fileName), "utf8");
  const { meta, body } = parseFrontmatter(source);
  const category = requireKey(meta, "category", slug);
  if (!isLibraryCategory(category)) {
    throw new Error(`"${slug}" has unknown category "${category}"`);
  }
  const date = requireKey(meta, "date", slug);
  return {
    slug,
    title: requireKey(meta, "title", slug),
    excerpt: requireKey(meta, "excerpt", slug),
    category,
    categorySlug: categorySlug(category),
    date,
    updated: meta.updated ?? date,
    image: meta.image,
    imageAlt: meta.imageAlt,
    draft: parseBool(meta.draft),
    readingTime: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
  };
}

let cache: LibraryPreviewItem[] | undefined;

/** Every library item, newest first. Empty (with a build log line) until content/library exists. */
export function getLibraryItems(): LibraryPreviewItem[] {
  if (cache) return cache;
  if (!fs.existsSync(LIBRARY_DIR)) {
    console.warn(
      "library preview: content/library/ does not exist yet; previews render empty",
    );
    cache = [];
    return cache;
  }
  const files = fs.readdirSync(LIBRARY_DIR).filter((f) => f.endsWith(".md"));
  cache = files.map(loadItem).sort((a, b) => b.date.localeCompare(a.date));
  const drafts = cache.filter((i) => i.draft).length;
  console.log(
    `library preview: ${cache.length - drafts} published, ${drafts} draft`,
  );
  return cache;
}

export interface PreviewOptions {
  /** Only these categories (any of). */
  categories?: readonly LibraryCategory[];
  /** Never these categories. Defaults to Technology & the Law (LIBRARY-SPEC §8). */
  exclude?: readonly LibraryCategory[];
  /** Include `draft: true` items (they carry the draft chip). Default true until Arthur clears them. */
  includeDrafts?: boolean;
}

export function getLibraryPreview(
  limit: number,
  options: PreviewOptions = {},
): LibraryPreviewItem[] {
  const exclude = options.exclude ?? ["Technology & the Law"];
  const includeDrafts = options.includeDrafts ?? true;
  return getLibraryItems()
    .filter((item) => includeDrafts || !item.draft)
    .filter((item) => !exclude.includes(item.category))
    .filter(
      (item) =>
        !options.categories || options.categories.includes(item.category),
    )
    .slice(0, limit);
}
