import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, requireKey } from "./frontmatter";
import { renderMarkdown } from "./markdown";

/**
 * Legacy loader for the 9 pre-redesign posts in content/posts/. The library
 * builder migrates them to content/library/ (CONTRACTS §6); this file goes
 * away with that migration.
 */

export type PostCategory =
  | "Latest News"
  | "Recent Events"
  | "Media Coverage"
  | "Press Releases"
  | "Client Alerts";

export interface Post {
  slug: string;
  title: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  updated?: string;
  /** The slug this post lived at on the old Wix site (redirect stub target). */
  oldSlug: string;
  category: PostCategory;
  image: string;
  imageAlt: string;
  readTime: string;
  excerpt: string;
  bodyHtml: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function loadPost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { meta, body } = parseFrontmatter(source);
  return {
    slug,
    title: requireKey(meta, "title", slug),
    date: requireKey(meta, "date", slug),
    updated: meta.updated,
    oldSlug: requireKey(meta, "oldSlug", slug),
    category: requireKey(meta, "category", slug) as PostCategory,
    image: requireKey(meta, "image", slug),
    imageAlt: requireKey(meta, "imageAlt", slug),
    readTime: requireKey(meta, "readTime", slug),
    excerpt: requireKey(meta, "excerpt", slug),
    bodyHtml: renderMarkdown(body),
  };
}

/** All posts, newest first. Count-verified: throws if the expected 9 are not found. */
export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files
    .map(loadPost)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (posts.length !== 9) {
    throw new Error(
      `Expected 9 posts, found ${posts.length}; check content/posts/`,
    );
  }
  return posts;
}

export function getPostBySlug(slug: string): Post {
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) throw new Error(`No post with slug "${slug}"`);
  return post;
}

export function getPostsByCategory(category: PostCategory): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2024-07-13" → "Jul 13, 2024". */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
