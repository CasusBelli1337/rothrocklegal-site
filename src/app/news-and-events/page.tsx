import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageTitleBand } from '@/components/PageTitleBand';
import { PostCard } from '@/components/PostCard';
import { SectionHeading } from '@/components/SectionHeading';
import { asset } from '@/config/site';
import { formatDate, getAllPosts, getPostsByCategory } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'News and Events',
  description:
    'News, events, press releases, and client alerts from Rothrock Legal — insights on AI and ' +
    'the law from Arthur E. Rothrock.',
  alternates: { canonical: '/news-and-events/' },
};

function ViewMoreButton({ label }: { label: string }) {
  return (
    <div className="mt-10 text-center">
      <Link href="#all-posts" className="btn-primary">
        {label}
      </Link>
    </div>
  );
}

export default function NewsAndEventsPage() {
  const latestNews = getPostsByCategory('Latest News');
  const recentEvents = getPostsByCategory('Recent Events');
  const pressReleases = getPostsByCategory('Press Releases');
  const clientAlerts = getPostsByCategory('Client Alerts');
  const allPosts = getAllPosts();

  return (
    <>
      <PageTitleBand title="News & Events" />

      <section id="latest-news" className="bg-panel px-6 py-16">
        <SectionHeading eyebrow="News" title="Latest News" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-3">
          {latestNews.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <ViewMoreButton label="View More News" />
      </section>

      <section id="recent-events" className="px-6 py-16">
        <SectionHeading eyebrow="Events" title="Recent Events" />
        <div className="mx-auto mt-10 max-w-3xl">
          {recentEvents.map((post) => (
            <Link
              key={post.slug}
              href={`/post/${post.slug}/`}
              className="flex flex-col overflow-hidden border border-gray-200 bg-white transition-shadow hover:shadow-md sm:flex-row"
            >
              <div className="relative h-52 sm:h-auto sm:w-2/5">
                <Image
                  src={asset(post.image)}
                  alt={post.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
              <div className="p-6 sm:w-3/5">
                <p className="text-xs text-gray-500">Arthur Rothrock · {formatDate(post.date)}</p>
                <h3 className="mt-2 font-heading text-2xl text-black">{post.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        <ViewMoreButton label="View More Events" />
      </section>

      <section id="press-releases" className="hex-band px-6 py-16">
        <SectionHeading eyebrow="Releases" title="Press Releases" tone="light" />
        <div className="mx-auto mt-10 grid max-w-2xl gap-8 sm:grid-cols-2">
          {pressReleases.map((post) => (
            <Link
              key={post.slug}
              href={`/post/${post.slug}/`}
              className="group relative block h-60 overflow-hidden"
            >
              <Image
                src={asset(post.image)}
                alt={post.imageAlt}
                fill
                className="object-cover brightness-50 transition group-hover:brightness-75"
                sizes="(max-width: 640px) 100vw, 320px"
              />
              <h3 className="absolute right-4 bottom-4 left-4 font-heading text-lg text-white">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
        <ViewMoreButton label="View more" />
      </section>

      <section id="client-alerts" className="bg-panel px-6 py-16">
        <SectionHeading eyebrow="Alerts" title="Client Alerts" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-3">
          {clientAlerts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section id="all-posts" className="px-6 py-16">
        <SectionHeading eyebrow="Archive" title="All Posts" />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200 border-t border-b border-gray-200">
          {allPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/post/${post.slug}/`}
              className="flex flex-col justify-between gap-1 py-4 hover:bg-panel sm:flex-row sm:items-center"
            >
              <span className="font-heading text-base text-black">{post.title}</span>
              <span className="shrink-0 text-xs text-gray-500">
                {post.category} · {formatDate(post.date)} · {post.readTime}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
