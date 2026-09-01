interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "nav" | "header" | "footer";
  id?: string;
}

/** 1200px content column with the paper gutters (DESIGN-BRIEF §4). */
export function Container({
  children,
  className = "",
  as: Tag = "div",
  id,
}: ContainerProps) {
  return (
    <Tag
      id={id}
      className={`mx-auto w-full max-w-[75rem] px-5 md:px-8 ${className}`}
    >
      {children}
    </Tag>
  );
}
