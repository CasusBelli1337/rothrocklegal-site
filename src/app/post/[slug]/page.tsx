import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { RedirectStub } from '@/components/RedirectStub';
import { asset } from '@/config/site';
import { formatDate, getAllPosts, getPostBySlug, type Post } from '@/lib/posts';

interface Params {
  slug: string;
}

/** Old Wix slugs export alongside the new ones as meta-refresh stubs. */
function findByOldSlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.oldSlug === slug);
}

export function generateStaticParams(): Params[] {
  const posts = getAllPosts();
  return [
    ...posts.map((post) => ({ slug: post.slug })),
    ...posts.map((post) => ({ slug: post.oldSlug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const moved = findByOldSlug(slug);
  if (moved) {
    return {
      title: `${moved.title} (moved)`,
      alternates: { canonical: `/post/${moved.slug}/` },
    };
  }
  const post = getPostBySlug(slug);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/post/${post.slug}/` },
    openGraph: { title: post.title, description: post.excerpt, images: [post.image] },
  };
}

const categories = [
  { label: 'All Posts', href: '/news-and-events/#all-posts' },
  { label: 'Recent Events', href: '/news-and-events/#recent-events' },
  { label: 'Latest News', href: '/news-and-events/#latest-news' },
  { label: 'Media Coverage', href: '/news-and-events/' },
  { label: 'Press Releases', href: '/news-and-events/#press-releases' },
  { label: 'Client Alerts', href: '/news-and-events/#client-alerts' },
];

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const moved = findByOldSlug(slug);
  if (moved) {
    return (
      <RedirectStub
        relativeTarget={`../${moved.slug}/`}
        href={`/post/${moved.slug}/`}
        label={moved.title}
      />
    );
  }
  const post = getPostBySlug(slug);
  const others = getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 2);

  return (
    <div className="bg-panel px-4 py-10">
      <nav
        aria-label="Post categories"
        className="mx-auto mb-6 flex max-w-3xl flex-wrap gap-x-6 gap-y-2 border-b border-gray-200 pb-3 text-sm text-navy"
      >
        {categories.map((c) => (
          <Link key={c.label} href={c.href} className="hover:text-maroon-band">
            {c.label}
          </Link>
        ))}
      </nav>

      <article className="mx-auto max-w-3xl border border-gray-200 bg-white p-6 sm:p-12">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <Image
            src={asset('/images/arthur-headshot.webp')}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span>
            Arthur Rothrock · {formatDate(post.date)} · {post.readTime}
          </span>
        </div>
        <h1 className="mt-5 font-heading text-3xl text-black sm:text-4xl">{post.title}</h1>
        {post.updated && (
          <p className="mt-3 text-sm text-gray-500">Updated: {formatDate(post.updated)}</p>
        )}
        <div
          className="post-body mt-6 space-y-4 text-[15px] leading-relaxed text-black [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />
        <div className="mt-10">
          <Image
            src={asset(post.image)}
            alt={post.imageAlt}
            width={720}
            height={480}
            className="w-full object-cover"
          />
        </div>
        <p className="mt-6 border-t border-gray-200 pt-4 text-sm">
          <Link href="/news-and-events/" className="text-navy underline hover:text-maroon-band">
            {post.category}
          </Link>
        </p>
      </article>

      <aside className="mx-auto mt-10 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg text-black">Recent Posts</h2>
          <Link href="/news-and-events/#all-posts" className="text-sm text-navy underline">
            See All
          </Link>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {others.map((other) => (
            <Link
              key={other.slug}
              href={`/post/${other.slug}/`}
              className="flex items-center gap-4 border border-gray-200 bg-white p-4 hover:shadow-md"
            >
              <Image
                src={asset(other.image)}
                alt={other.imageAlt}
                width={72}
                height={72}
                className="h-18 w-18 shrink-0 object-cover"
              />
              <span className="font-heading text-sm text-black">{other.title}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
