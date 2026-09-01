export interface Testimonial {
  name: string;
  /** Relationship line, e.g. 'Client, trust dispute'. Only what is verified. */
  relationship: string;
  photo?: string;
  /** Verbatim from the previous site (CHANGES.md); surrounding quote marks removed. */
  quote: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    name: "Darius",
    relationship: "Client, family estate matter",
    photo: "/images/darius.webp",
    quote:
      "I had the pleasure of working with Arthur a few years back on a family estate matter and " +
      "was impressed with my fellow Pennsylvanian's responsiveness, knowledge of the underlying " +
      "subject matter and diligence that led to a very positive result. Arthur doesn't let moss " +
      "grow on him when he's addressing your legal needs and you will be happy you engaged him!",
  },
  {
    name: "Mark",
    relationship: "Client",
    quote:
      "I wholeheartedly endorse Arthur. His keen mind, relentless determination, and ability to " +
      "transition from a comforting ally to a fierce advocate make him an outstanding lawyer.",
  },
  {
    name: "Tony",
    relationship: "Client",
    quote:
      "Choosing Arthur was the wisest choice I made for my legal issue. His astute analysis, " +
      "calming nature, and courageous representation, paired with his dedication to keeping me " +
      "updated and composed, make him an indispensable resource for anyone aiming to achieve the " +
      "most favorable result.",
  },
];

export const testimonialDisclaimer =
  "Every case is different. Past results do not guarantee a similar outcome. A testimonial is " +
  "not a guarantee, warranty, or prediction about your matter.";
