/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

// actions/configure-pages injects `basePath` into the object literal above on CI.
// Expose it to app code so string image srcs can be prefixed (next/image does not
// apply basePath to unoptimized string srcs).
nextConfig.env = { NEXT_PUBLIC_BASE_PATH: nextConfig.basePath ?? '' };

export default nextConfig;
