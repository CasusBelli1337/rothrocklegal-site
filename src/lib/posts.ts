import fs from 'node:fs';
import path from 'node:path';
import { renderMarkdown } from './markdown';

export type PostCategory =
  | 'Latest News'
  | 'Recent Events'
  | 'Media Coverage'
  | 'Press Releases'
  | 'Client Alerts';

export interface Post {
  slug: string;
  title: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  /** ISO date of the last update shown on the post, if any. */
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

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function parseFrontmatter(source: string): { meta: Record<string, string>; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match) throw new Error('Post is missing frontmatter');
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(': ');
    if (sep === -1) throw new Error(`Bad frontmatter line: ${line}`);
    const value = line.slice(sep + 2).trim();
    meta[line.slice(0, sep).trim()] = value.replace(/^"(.*)"$/, '$1');
  }
  return { meta, body: source.slice(match[0].length).trim() };
}

function require_(meta: Record<string, string>, key: string, slug: string): string {
  const value = meta[key];
  if (!value) throw new Error(`Post "${slug}" is missing frontmatter key "${key}"`);
  return value;
}

function loadPost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, '');
  const source = fs.readFileSync(path.join(POSTS_DIR, fileName), 'utf8');
  const { meta, body } = parseFrontmatter(source);
  return {
    slug,
    title: require_(meta, 'title', slug),
    date: require_(meta, 'date', slug),
    updated: meta.updated,
    oldSlug: require_(meta, 'oldSlug', slug),
    category: require_(meta, 'category', slug) as PostCategory,
    image: require_(meta, 'image', slug),
    imageAlt: require_(meta, 'imageAlt', slug),
    readTime: require_(meta, 'readTime', slug),
    excerpt: require_(meta, 'excerpt', slug),
    bodyHtml: renderMarkdown(body),
  };
}

/** All posts, newest first. Count-verified: throws if the expected 9 are not found. */
export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map(loadPost).sort((a, b) => b.date.localeCompare(a.date));
  if (posts.length !== 9) {
    throw new Error(`Expected 9 posts, found ${posts.length} — check content/posts/`);
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024-07-13" → "Jul 13, 2024" (matches the Wix date style). */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
