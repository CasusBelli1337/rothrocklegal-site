import { Eyebrow } from "./Eyebrow";

interface SectionHeadingProps {
  eyebrow?: string;
  /** May include an `<em className="em-word">` for the emphasized word. */
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}

/** Eyebrow + heading + optional lead, left-aligned by default (DESIGN-BRIEF §6). */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "dark",
  as: Tag = "h2",
  className = "",
  id,
}: SectionHeadingProps) {
  const centered = align === "center";
  const titleColor = tone === "light" ? "text-white" : "text-ink";
  const leadColor = tone === "light" ? "text-white/80" : "text-ink-2";
  const size = Tag === "h1" ? "text-h1" : "text-h2";
  return (
    <div
      className={`${centered ? "mx-auto text-center" : ""} max-w-[46rem] ${className}`}
    >
      {eyebrow && (
        <Eyebrow tone={tone === "light" ? "light" : "brass"}>{eyebrow}</Eyebrow>
      )}
      <Tag
        id={id}
        className={`${eyebrow ? "mt-3" : ""} font-serif ${size} ${titleColor}`}
      >
        {title}
      </Tag>
      {lead && (
        <p
          className={`mt-4 max-w-[60ch] text-lead ${leadColor} ${centered ? "mx-auto" : ""}`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
