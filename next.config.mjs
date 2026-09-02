/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

// Armory website-editor preview: the editor spawns `next dev` behind a Caddy
// mount (default /_preview) and sets EDITOR_PREVIEW=1. Adopt that basePath
// ONLY then — never in CI or production builds.
// Preview-only tools (the lens switcher pill in src/app/layout.tsx). The key is
// always present so the build inlines it: '1' only in the editor preview, never
// on CI or production builds, where '0' lets webpack drop the component entirely.
const previewTools = { NEXT_PUBLIC_PREVIEW_TOOLS: '0' };
if (process.env.EDITOR_PREVIEW === '1') {
  nextConfig.basePath = process.env.EDITOR_PREVIEW_BASE_PATH || '/_preview';
  previewTools.NEXT_PUBLIC_PREVIEW_TOOLS = '1';
}

// actions/configure-pages injects `basePath` into the object literal above on CI.
// Expose it to app code so string image srcs can be prefixed (next/image does not
// apply basePath to unoptimized string srcs).
nextConfig.env = { NEXT_PUBLIC_BASE_PATH: nextConfig.basePath ?? '', ...previewTools };

export default nextConfig;
