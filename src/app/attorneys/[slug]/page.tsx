import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { AppearancesList } from '@/components/team/AppearancesList';
import { ProfileBio } from '@/components/team/ProfileBio';
import { ProfileHero } from '@/components/team/ProfileHero';
import { ProfileSidebar } from '@/components/team/ProfileSidebar';
import { RecognitionStrip } from '@/components/team/RecognitionStrip';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getTeamMember, hasPlaceholders, team, teamHref, type TeamMember } from '@/config/team';
import { profilePage } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return team.map((m) => ({ slug: m.slug }));
}

/** ≤ 155 chars: name, title, firm, city, focus (SEO-SPEC §4). */
function metaDescription(member: TeamMember): string {
  return `${member.name}, ${member.title} at Rothrock Legal in San Jose. ${member.focus}.`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamMember(slug);
  return pageMetadata({
    title: `${member.name} – ${member.title}`,
    description: metaDescription(member),
    path: teamHref(member),
    type: 'profile',
    noindex: hasPlaceholders(member),
  });
}

function Recognition({ member }: { member: TeamMember }) {
  if (member.credentials.length === 0) return null;
  return (
    <section className="bg-sand py-14 lg:py-16" aria-labelledby="recognition">
      <Container>
        <SectionHeading
          id="recognition"
          eyebrow="Recognition"
          title="Awards, roles, and the podcast."
        />
        <div className="mt-8">
          <RecognitionStrip member={member} />
        </div>
      </Container>
    </section>
  );
}

function SpeakingAndPress({ member }: { member: TeamMember }) {
  if (member.appearances.length === 0 && !member.podcast) return null;
  return (
    <section className="py-14 lg:py-16" aria-labelledby="speaking">
      <Container>
        <SectionHeading
          id="speaking"
          eyebrow="Speaking and press"
          title="Talks, articles, and press."
        />
        <div className="mt-8 max-w-[52rem]">
          <AppearancesList member={member} />
        </div>
      </Container>
    </section>
  );
}

export default async function AttorneyPage({ params }: Params) {
  const { slug } = await params;
  const member = getTeamMember(slug);
  return (
    <>
      <ProfileHero member={member} />
      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-16 lg:py-20">
        <div className="lg:col-span-7">
          <h2 className="sr-only">Biography</h2>
          <ProfileBio member={member} />
        </div>
        <ProfileSidebar member={member} className="lg:col-span-5 xl:col-span-4 xl:col-start-9" />
      </Container>
      <Recognition member={member} />
      <SpeakingAndPress member={member} />
      <CtaBand />
      <JsonLd data={profilePage(member)} />
    </>
  );
}
