import { buildLlmsTxt } from '@/lib/seo/llms';

export const dynamic = 'force-static';

/** public /llms.txt generated from config at build (SEO-SPEC §7, lib/seo/llms.ts). */
export function GET(): Response {
  const body = buildLlmsTxt();
  console.log(`llms.txt: ${(body.match(/\/library\/[^/]+\//g) ?? []).length} articles listed`);
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
