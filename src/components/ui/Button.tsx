import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  /** 'dark' = the button sits on a maroon background. */
  tone?: 'light' | 'dark';
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  /** Spinner replaces the label; width stays locked. */
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold whitespace-nowrap ' +
  'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const sizes = { md: 'h-12 px-6 text-[15px]', sm: 'h-11 px-5 text-[15px]' };

const variants: Record<ButtonVariant, Record<'light' | 'dark', string>> = {
  primary: {
    light: 'bg-maroon-700 text-white hover:bg-maroon-800 active:bg-maroon-900',
    dark: 'bg-maroon-700 text-white hover:bg-maroon-800 active:bg-maroon-900',
  },
  secondary: {
    light: 'border border-ink text-ink hover:bg-sand',
    dark: 'border border-white text-white hover:bg-white/10',
  },
  ghost: {
    light: 'text-maroon-700 hover:bg-maroon-50',
    dark: 'text-white hover:bg-white/10',
  },
  inverse: {
    light: 'bg-white text-maroon-700 hover:bg-maroon-50',
    dark: 'bg-white text-maroon-700 hover:bg-maroon-50',
  },
};

function Spinner() {
  return (
    <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </span>
  );
}

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: 'md' | 'sm' = 'md',
  tone: 'light' | 'dark' = 'light',
  className = '',
): string {
  return `${base} ${sizes[size]} ${variants[variant][tone]} ${className}`;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  tone = 'light',
  href,
  type = 'button',
  disabled,
  loading,
  onClick,
  className,
  ariaLabel,
}: ButtonProps) {
  const cls = buttonClass(variant, size, tone, className);
  if (href) {
    const external = /^(https?:|tel:|mailto:)/.test(href);
    if (external) {
      return (
        <a href={href} className={cls} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className={loading ? 'invisible' : undefined}>{children}</span>
      {loading && <Spinner />}
    </button>
  );
}
