import { Button, PhoneButton } from "./Button";
import { Container } from "./Container";

interface CtaBandProps {
  title?: React.ReactNode;
  lead?: React.ReactNode;
  primary?: { label: string; href: string };
  id?: string;
}

/** Maroon gradient band: white h2, one lead line, inverse button + phone (DESIGN-BRIEF §6). */
export function CtaBand({
  title = "Tell us what happened.",
  lead = "A few sentences is enough. We will read it, check the clock, and call you back.",
  primary = { label: "Tell us what happened", href: "/contact/" },
  id,
}: CtaBandProps) {
  return (
    <section id={id} className="band-maroon py-16 lg:py-20">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[40rem]">
          <h2 className="font-serif text-h2 text-white">{title}</h2>
          <p className="mt-4 text-lead text-white/80">{lead}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="inverse" tone="dark" href={primary.href}>
            {primary.label}
          </Button>
          <PhoneButton tone="dark" />
        </div>
      </Container>
    </section>
  );
}
