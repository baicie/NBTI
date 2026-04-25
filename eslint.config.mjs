import antfu from '@antfu/eslint-config'

export default antfu(
  {
    react: true,

    stylistic: false,

    ignores: ['docs/', 'scripts/vitest.config.ts'],
  },

  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    },
  },

  {
    files: ['**/tsconfig*.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },

  {
    files: ['scripts/**'],
    rules: {
      'node/prefer-global/process': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'ts/no-use-before-define': 'off',
    },
  },

  {
    files: ['apps/web/**'],
    rules: {
      'ts/no-use-before-define': 'off',
      'react-refresh/only-export-components': 'warn',
    },
  },

  {
    files: ['idea/**'],
    rules: {
      'markdown/no-multiple-h1': 'off',
    },
  },

  {
    files: ['packages/core/**'],
    rules: {
      'regexp/no-unused-capturing-group': 'off',
    },
  },
)
