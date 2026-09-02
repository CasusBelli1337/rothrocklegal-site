import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { ignores: ['node_modules/**', '.next/**', 'out/**', 'next-env.d.ts'] },
  {
    // Verbatim copy of the shared intake contract (#seam:rothrock-intake-contract); never edited here.
    files: ['src/lib/intake/contract.ts'],
    rules: { '@typescript-eslint/no-empty-object-type': 'off' },
  },
];

export default config;
