/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

// Armory website-editor preview: the editor spawns `next dev` behind a Caddy
// mount (default /_preview) and sets EDITOR_PREVIEW=1. Adopt that basePath
// ONLY then — never in CI or production builds.
if (process.env.EDITOR_PREVIEW === '1') {
  nextConfig.basePath = process.env.EDITOR_PREVIEW_BASE_PATH || '/_preview';
}

// actions/configure-pages injects `basePath` into the object literal above on CI.
// Expose it to app code so string image srcs can be prefixed (next/image does not
// apply basePath to unoptimized string srcs).
nextConfig.env = { NEXT_PUBLIC_BASE_PATH: nextConfig.basePath ?? '' };

export default nextConfig;
