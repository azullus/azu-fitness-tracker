import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  // Ignore patterns
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'public/**',
      '*.config.js',
      '*.config.mjs',
      'e2e/**',
      'scripts/*.js',
      'jest.globals.js',
      'next-env.d.ts',
    ],
  },
  // Extend Next.js configs using compat layer
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Custom rules for source files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Relaxed rules for test files
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;
