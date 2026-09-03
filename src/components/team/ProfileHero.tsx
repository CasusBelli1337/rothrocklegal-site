import Image from 'next/image';
import { hasHeadshot } from '@/components/layout/TeamCard';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { asset, consultCta, secondaryCta } from '@/config/site';
import { hasPlaceholders, type TeamMember } from '@/config/team';
import type { Crumb } from '@/types/content';

function Portrait({ member }: { member: TeamMember }) {
  return (
    <div className="lg:col-span-5 lg:justify-self-end">
      <div className="aspect-[4/5] w-full max-w-[18rem] overflow-hidden bg-sand outline outline-1 outline-offset-[10px] outline-brass-400 lg:w-[24rem] lg:max-w-none">
        {hasHeadshot(member) ? (
          <Image
            src={asset(member.image.large)}
            alt={member.image.alt}
            width={800}
            height={800}
            priority
            sizes="(max-width: 1024px) 18rem, 24rem"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <InitialAvatar name={member.name} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}

/** Maroon hero: breadcrumbs, title eyebrow, name, bar line, focus, contact buttons, headshot. */
export function ProfileHero({ member }: { member: TeamMember }) {
  const trail: Crumb[] = [
    { label: 'Home', href: '/' },
    { label: 'Attorneys', href: '/attorneys/' },
    { label: member.name },
  ];
  return (
    <section className="band-maroon">
      <Container className="py-10 lg:py-16">
        <Breadcrumbs tone="light" trail={trail} />
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <Portrait member={member} />
          <div className="lg:order-first lg:col-span-7">
            <Eyebrow tone="light" rule>
              {member.title}
            </Eyebrow>
            <h1 className="mt-4 font-serif text-h1 text-white">{member.name}</h1>
            {member.heroLine && (
              <p className="mt-4 max-w-[34ch] font-serif-italic text-lead text-white/85 italic">
                {member.heroLine}
              </p>
            )}
            <div className="mt-6 space-y-1.5">
              {member.barStatus && <p className="text-small text-white/75">{member.barStatus}</p>}
              <p className="text-body text-white/85">{member.focus}</p>
            </div>
            {hasPlaceholders(member) && (
              <Badge tone="dark" className="mt-5">
                Draft &ndash; pending attorney review
              </Badge>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="inverse" tone="dark" href={consultCta.href}>
                {consultCta.label}
              </Button>
              <Button variant="secondary" tone="dark" href={secondaryCta.href}>
                {secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
