import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint config for all packages/apps in the monorepo.
 * Includes TypeScript and Prettier rules.
 *
 * Usage:
 *   import { base } from '@qach/eslint-config';
 */
export const base = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
];
