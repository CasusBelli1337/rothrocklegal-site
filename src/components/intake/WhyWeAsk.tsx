interface WhyWeAskProps {
  children: React.ReactNode;
  className?: string;
}

/** The plain "why we ask" line under a question or document slot. */
export function WhyWeAsk({ children, className = '' }: WhyWeAskProps) {
  return (
    <p className={`text-small text-ink-3 ${className}`}>
      <span className="eyebrow mr-2">Why we ask</span>
      {children}
    </p>
  );
}
