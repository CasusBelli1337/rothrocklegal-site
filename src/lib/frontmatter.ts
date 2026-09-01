/**
 * Minimal YAML-ish frontmatter parser shared by every content loader
 * (`key: value` lines only; quoted values are unquoted). No dependencies.
 */

export interface Frontmatter {
  meta: Record<string, string>;
  body: string;
}

export function parseFrontmatter(source: string): Frontmatter {
  const normalized = source.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
  if (!match) throw new Error("Content file is missing frontmatter");
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    if (line.trim() === "") continue;
    const sep = line.indexOf(":");
    if (sep === -1) throw new Error(`Bad frontmatter line: ${line}`);
    const value = line.slice(sep + 1).trim();
    meta[line.slice(0, sep).trim()] = value
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");
  }
  return { meta, body: normalized.slice(match[0].length).trim() };
}

/** Throws with the file context when a required key is missing or empty. */
export function requireKey(
  meta: Record<string, string>,
  key: string,
  context: string,
): string {
  const value = meta[key];
  if (!value)
    throw new Error(`"${context}" is missing frontmatter key "${key}"`);
  return value;
}

/** `tags: a, b, c` → ['a', 'b', 'c']. */
export function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "");
}

export function parseBool(value: string | undefined): boolean {
  return value === "true";
}
