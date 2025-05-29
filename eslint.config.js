import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'],
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'],
  })),
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      ...pluginReact.configs.flat.recommended.settings,
      react: {
        version: '19',
      },
    },
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'],
  },
]);
