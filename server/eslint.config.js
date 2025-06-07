// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      "node_modules/",           // Always ignore node_modules
      "**/__tests__/**",         // Ignore any files within __tests__ subdirectories
      "**/*.test.{js,mjs,cjs}",  // Ignore files named *.test.js, *.test.mjs, *.test.cjs
      "**/*.spec.{js,mjs,cjs}"   // Ignore files named *.spec.js, *.spec.mjs, *.spec.cjs
      // Add any other top-level files or directories you want ESLint to completely skip
      // e.g., "build/", "dist/"
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
