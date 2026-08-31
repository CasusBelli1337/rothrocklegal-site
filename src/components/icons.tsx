/** Minimal inline SVG icon set (the Wix originals were baked into images). */

interface IconProps {
  className?: string;
}

function Svg({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-6 w-6'}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PinIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function PhoneIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 5c0 8 7 15 15 15l2-4-4.5-2-2 2c-2.5-1-5.5-4-6.5-6.5l2-2L8 3 4 5z" />
    </Svg>
  );
}

export function MailIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  );
}

export function LinkedInIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className ?? 'h-6 w-6'} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

export function UploadDocIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M12 16v-6m0 0-2.5 2.5M12 10l2.5 2.5" />
    </Svg>
  );
}

export function AiGearIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 10.5h4M10 13.5h2.5" />
      <path d="M9.5 7V4m5 3V4M9.5 20v-3m5 3v-3M7 9.5H4m3 5H4M20 9.5h-3m3 5h-3" />
    </Svg>
  );
}

export function CheckCircleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </Svg>
  );
}

export function QuoteIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className ?? 'h-6 w-6'} aria-hidden="true">
      <path d="M10.5 6C7 7.5 5 10 5 13.5c0 2.5 1.6 4.5 3.9 4.5 2 0 3.6-1.6 3.6-3.7 0-2-1.4-3.4-3.3-3.4-.3 0-.7 0-1 .1.5-1.6 1.8-3 3.6-3.9L10.5 6zm8.5 0c-3.5 1.5-5.5 4-5.5 7.5 0 2.5 1.6 4.5 3.9 4.5 2 0 3.6-1.6 3.6-3.7 0-2-1.4-3.4-3.3-3.4-.3 0-.7 0-1 .1.5-1.6 1.8-3 3.6-3.9L19 6z" />
    </svg>
  );
}

export function BulbIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.9 1.5 2.6h4c0-.7.7-2 1.5-2.6A6 6 0 0 0 12 3z" />
    </Svg>
  );
}

export function ScalesIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4v16m-5 0h10M12 6H6m6 0h6M6 6l-2.5 6a3 3 0 0 0 5 0L6 6zm12 0-2.5 6a3 3 0 0 0 5 0L18 6z" />
    </Svg>
  );
}

export function DocCheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="m9.5 14 2 2 3.5-3.5" />
    </Svg>
  );
}

export function GearIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3m0 18v-2m7-7h2M3 12h2m11.6-4.6 1.4-1.4M6 18l1.4-1.4m0-9.2L6 6m12 12-1.4-1.4" />
    </Svg>
  );
}

export function PeopleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8.5" cy="9" r="2.5" />
      <circle cx="15.5" cy="9" r="2.5" />
      <path d="M4 19c0-2.5 2-4.5 4.5-4.5S13 16.5 13 19m-1.5-4.1a4.5 4.5 0 0 1 8.5 4.1" />
    </Svg>
  );
}

export function BriefcaseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="8" width="18" height="12" rx="1" />
      <path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8m-12 5h18" />
    </Svg>
  );
}
