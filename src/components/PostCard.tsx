import Image from 'next/image';
import Link from 'next/link';
import { asset } from '@/config/site';
import { formatDate, type Post } from '@/lib/posts';

interface PostCardProps {
  post: Post;
  /** Show the date + read-time line (merged in from the old /blog index). */
  showMeta?: boolean;
}

export function PostCard({ post, showMeta = false }: PostCardProps) {
  return (
    <article className="border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/post/${post.slug}/`} className="block">
        <div className="relative h-44 w-full">
          <Image
            src={asset(post.image)}
            alt={post.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        </div>
        <div className="p-5">
          <h3 className="font-heading text-lg leading-snug text-black">{post.title}</h3>
          {showMeta && (
            <p className="mt-2 text-xs text-gray-500">
              {formatDate(post.date)} · {post.readTime}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-navy">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
