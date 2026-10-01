import { buildLlmsFullTxt } from '@/lib/seo/llms';

export const dynamic = 'force-static';

/** public /llms-full.txt: every practice page and published article in full (lib/seo/llms.ts). */
export function GET(): Response {
  const body = buildLlmsFullTxt();
  console.log(`llms-full.txt: ${body.length} chars, ${(body.match(/^URL: /gm) ?? []).length} documents`);
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
