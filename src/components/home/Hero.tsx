import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button, PhoneButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { asset } from "@/config/site";

const chips: {
  label: React.ReactNode;
  image?: { src: string; alt: string; width: number; height: number };
}[] = [
  {
    label: <>Super Lawyers&reg; Rising Stars 2020&ndash;2026</>,
    image: {
      src: "/images/badges/super-lawyers-rising-stars-2026.webp",
      alt: "",
      width: 192,
      height: 200,
    },
  },
  {
    label: <>Best Lawyers: Ones to Watch&reg; in America 2024&ndash;2027</>,
    image: {
      src: "/images/badges/best-lawyers-ones-to-watch-2027-trusts-estates.webp",
      alt: "",
      width: 171,
      height: 200,
    },
  },
  { label: "Vice Chair, ABA AI & Robotics National Institute" },
  { label: <>Santa Clara County Superior Court &ndash; Probate Division</> },
];

/** HOMEPAGE-SPEC §1: 7/5 split, photo first on mobile, chips scroll in one row. */
export function Hero() {
  return (
    <section className="band-maroon">
      <Container className="grid gap-10 py-12 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-20">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <Eyebrow tone="light" rule>
            Trust &amp; estate litigation &middot; San Jose &amp; the Bay Area
          </Eyebrow>
          <h1 className="mt-5 font-serif text-display text-white">
            We handle trust and will disputes for{" "}
            <em className="em-word">families</em> in San Jose and the Bay Area.
          </h1>
          <p className="mt-6 max-w-[38rem] text-lead text-white/80">
            A sibling changed the trust. The trustee won&rsquo;t show the
            accounting. Someone got to Dad before he died. Deadlines can be as
            short as 120 days &ndash; call before yours runs.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="inverse" href="/contact/">
              Tell us what happened
            </Button>
            <PhoneButton tone="dark" />
          </div>
          <ul
            aria-label="Recognitions"
            className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
          >
            {chips.map((chip, i) => (
              <li key={i} className="shrink-0">
                <Badge tone="dark" image={chip.image}>
                  {chip.label}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl lg:aspect-[4/5]">
            <Image
              src={asset("/images/arthur-hero.webp")}
              alt="Arthur E. Rothrock, founder of Rothrock Legal"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
