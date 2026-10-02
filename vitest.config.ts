import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Mirror tsconfig's `@/*` so loaders that import config can be tested.
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  // Component tests (.test.tsx) opt into jsdom with a `@vitest-environment jsdom` docblock.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    // scripts/*.test.mjs cover the pure parts of the build and deploy scripts (scripts/indexnow.mjs).
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
    environment: 'node',
  },
});
