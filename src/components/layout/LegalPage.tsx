import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { site } from '@/config/site';
import { webPage } from '@/lib/seo/jsonld';

interface LegalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  children: React.ReactNode;
}

/** Shell for the privacy policy and disclaimer: hero + prose body. The draft notice follows `site.legalPagesDraft`. */
export function LegalPage({ eyebrow, title, description, path, children }: LegalPageProps) {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-14">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: title }]} />
          <div className="mt-8 max-w-[52rem]">
            <Eyebrow rule>{eyebrow}</Eyebrow>
            <h1 className="mt-4 font-serif text-h1 text-ink">{title}</h1>
            {site.legalPagesDraft && (
              <p className="mt-6 border-t-4 border-brass-400 bg-brass-100 p-4 text-small font-medium text-maroon-950">
                Draft &ndash; pending attorney review. This page was prepared as part of the website
                redesign and has not yet been approved for publication.
              </p>
            )}
          </div>
        </Container>
      </section>
      <Container className="max-w-[46rem] py-14 lg:py-20">
        <div className="prose-article">{children}</div>
      </Container>
      <JsonLd data={webPage({ path, title, description, updated: site.lastUpdated })} />
    </>
  );
}
