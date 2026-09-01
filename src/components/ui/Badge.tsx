import Image from "next/image";
import { asset } from "@/config/site";

interface BadgeProps {
  children: React.ReactNode;
  /** 'brass' on light backgrounds; 'dark' = white/80 chip on maroon. */
  tone?: "brass" | "dark";
  /** Optional badge art, rendered 16px tall inside the chip. */
  image?: { src: string; alt: string; width: number; height: number };
  className?: string;
}

/** Award / trust chip. Text is the award name exactly as conferred (DESIGN-BRIEF §6). */
export function Badge({
  children,
  tone = "brass",
  image,
  className = "",
}: BadgeProps) {
  const tones = {
    brass: "bg-brass-100 text-maroon-950",
    dark: "border border-white/20 bg-white/10 text-white",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold leading-none whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {image && (
        <Image
          src={asset(image.src)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-4 w-auto"
        />
      )}
      {children}
    </span>
  );
}
