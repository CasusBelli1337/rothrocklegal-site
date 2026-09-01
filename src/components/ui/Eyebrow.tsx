interface EyebrowProps {
  children: React.ReactNode;
  /** 24px brass rule to the left. */
  rule?: boolean;
  /** 'light' for maroon backgrounds (never brass text on maroon). */
  tone?: "brass" | "light";
  className?: string;
  as?: "p" | "span";
}

export function Eyebrow({
  children,
  rule,
  tone = "brass",
  className = "",
  as: Tag = "p",
}: EyebrowProps) {
  const color = tone === "light" ? "text-white/75" : "text-brass-600";
  const ruleColor = tone === "light" ? "bg-white/40" : "bg-brass-400";
  return (
    <Tag
      className={`eyebrow inline-flex items-center gap-3 ${color} ${className}`}
    >
      {rule && <span aria-hidden="true" className={`h-px w-6 ${ruleColor}`} />}
      {children}
    </Tag>
  );
}
