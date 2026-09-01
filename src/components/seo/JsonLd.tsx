import type { JsonLdObject } from "@/lib/seo/jsonld";

/** Renders one JSON-LD script. `<` is escaped so markup can never break out of the tag. */
export function JsonLd({ data }: { data: JsonLdObject }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
