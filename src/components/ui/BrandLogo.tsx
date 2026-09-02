import { asset, site } from '@/config/site';

/** viewBox size of each `/images/logo-<lockup>-<tone>.svg`; sets the intrinsic aspect ratio. */
const lockups = {
  /** RL monogram only. */
  mark: { width: 733, height: 623 },
  /** Monogram over the wordmark (the designer's primary lockup). */
  full: { width: 1628, height: 882 },
  /** Monogram beside the wordmark, for the header. */
  horizontal: { width: 3710, height: 623 },
} as const;

export type LogoLockup = keyof typeof lockups;
export type LogoTone = 'maroon' | 'white';

type BrandLogoProps = {
  lockup: LogoLockup;
  tone: LogoTone;
  /** Sets the rendered height (e.g. `h-11 w-auto`); the SVG scales without loss. */
  className?: string;
  /** Pass `""` when a wrapping link already names the destination. */
  alt?: string;
  /** Above the fold (the header): fetch it first and render it synchronously. */
  priority?: boolean;
};

/** Transparent, trimmed logo that sits on any background: SVG with a PNG fallback. */
export function BrandLogo({ lockup, tone, className, alt = site.name, priority }: BrandLogoProps) {
  const base = asset(`/images/logo-${lockup}-${tone}`);
  const { width, height } = lockups[lockup];
  return (
    <picture>
      <source type="image/svg+xml" srcSet={`${base}.svg`} />
      <img
        src={`${base}.png`}
        alt={alt}
        width={width}
        height={height}
        className={className}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
