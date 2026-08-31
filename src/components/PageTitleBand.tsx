/** Maroon hexagon-pattern band carrying a page title (About Us, Contact Us, ...). */
export function PageTitleBand({ title }: { title: string }) {
  return (
    <div className="hex-band py-14 text-center">
      <h1 className="font-serif-accent text-3xl text-white md:text-4xl">{title}</h1>
    </div>
  );
}
