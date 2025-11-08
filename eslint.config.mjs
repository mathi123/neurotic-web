import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    ignorePatterns: ['.next/', 'node_modules/', 'next-env.d.ts', 'app/storage/client'],
    rules: {
      // Enforce a maximum line length
      'max-len': ['warn', { code: 144 }],
      // Prefer single quotes
      quotes: ['error', 'single', { avoidEscape: true }],
      // Ensure files end with a newline
      'eol-last': ['error', 'always'],
      // Enforce sorted imports
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true, // Allows grouping via other rules/plugins
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
    },
    overrides: [
      {
        files: ['**/*.spec.ts'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
        },
      },
      {
        files: ['app/app/components/ui/**/*'],
        rules: {
          'max-len': 'off',
        },
      },
    ],
  }),
];

export default eslintConfig;
