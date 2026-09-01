import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { InitialAvatar } from "@/components/ui/InitialAvatar";
import { asset } from "@/config/site";
import { teamHref, type TeamMember } from "@/config/team";

/** Build-time check so a missing headshot renders the initials panel, never a broken image. */
export function hasHeadshot(member: TeamMember): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", member.image.large));
}

interface TeamCardProps {
  member: TeamMember;
  /** 'sm' uses the 400px headshot (mobile 2-up grids). */
  size?: "md" | "sm";
  headingLevel?: "h2" | "h3";
}

/** 4:5 photo, name, title, one-line focus, "Read bio" (DESIGN-BRIEF §6). */
export function TeamCard({
  member,
  size = "md",
  headingLevel: Tag = "h3",
}: TeamCardProps) {
  const src = size === "sm" ? member.image.small : member.image.large;
  const px = size === "sm" ? 400 : 800;
  return (
    <Link
      href={teamHref(member)}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon-500 rounded-xl"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-maroon-100">
        {hasHeadshot(member) ? (
          <Image
            src={asset(src)}
            alt={member.image.alt}
            width={px}
            height={px}
            sizes={
              size === "sm"
                ? "(max-width: 640px) 50vw, 300px"
                : "(max-width: 768px) 50vw, 300px"
            }
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <InitialAvatar name={member.name} className="h-full w-full" />
        )}
      </div>
      <Tag className="mt-4 font-sans text-h4 text-ink transition-colors group-hover:text-maroon-700">
        {member.name}
      </Tag>
      <p className="mt-1 text-meta text-ink-3">{member.title}</p>
      <p className="mt-2 text-small text-ink-2">{member.focus}</p>
      <p className="mt-3 text-small font-medium text-maroon-700">
        Read bio <span aria-hidden="true">&rarr;</span>
      </p>
    </Link>
  );
}
