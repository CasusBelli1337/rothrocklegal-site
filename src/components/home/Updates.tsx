import Image from 'next/image';
import { PostCard } from '@/components/PostCard';
import { asset } from '@/config/site';
import { getPostsByCategory } from '@/lib/posts';

/** "UPDATES / Latest News And Events" — the three Latest News posts, as on Wix. */
export function Updates() {
  const posts = getPostsByCategory('Latest News').slice(0, 3);
  return (
    <section className="bg-panel px-6 py-20">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-6">
        <Image
          src={asset('/images/gavel.webp')}
          alt=""
          width={130}
          height={120}
          className="hidden sm:block"
        />
        <div className="text-center">
          <p className="eyebrow">Updates</p>
          <h2 className="font-serif-accent mt-2 text-3xl font-bold text-black">
            Latest News And Events
          </h2>
        </div>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
