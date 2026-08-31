/**
 * Tasteful initial-letter avatar for testimonial authors whose Wix photos
 * were gray placeholder silhouettes (see CHANGES.md).
 */
export function InitialAvatar({ name }: { name: string }) {
  return (
    <div
      role="img"
      aria-label={name}
      className="flex h-full w-full items-center justify-center bg-maroon-btn"
    >
      <span className="font-serif-accent text-6xl text-gold">{name.charAt(0)}</span>
    </div>
  );
}
