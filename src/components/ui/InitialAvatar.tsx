interface InitialAvatarProps {
  name: string;
  className?: string;
  /** Text size class for the initial. */
  size?: "sm" | "lg";
}

/** Serif initial on a sand panel, for people without a photo. */
export function InitialAvatar({
  name,
  className = "",
  size = "lg",
}: InitialAvatarProps) {
  const initials = name
    .replace(/["“”]/g, "")
    .split(/\s+/)
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center bg-sand text-ink-3 ${className}`}
    >
      <span
        className={`font-serif font-medium ${size === "lg" ? "text-5xl" : "text-xl"}`}
      >
        {initials}
      </span>
    </div>
  );
}
