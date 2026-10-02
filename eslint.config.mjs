// Purpose: Apply Adobe's official Premiere action-scope checks to the host adapter.
import premierepro from '@adobe/eslint-plugin-premierepro';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  { ignores: ['dist/**', 'node_modules/**'] },
  { ...js.configs.recommended, files: ['src/**/*.js'] },
  { ...premierepro.configs.recommended, files: ['src/premiere.js'] },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        AbortController: 'readonly',
        clearTimeout: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
);
