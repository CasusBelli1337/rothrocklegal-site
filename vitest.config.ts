import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Mirror tsconfig's `@/*` so loaders that import config can be tested.
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
