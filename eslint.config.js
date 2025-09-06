import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'output/**',
      '**/*.js',
      '**/*.d.ts',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },

  // Source TypeScript files configuration
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
      sonarjs: sonarjs,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',

      // General JavaScript rules
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off', // Allow console in CLI tool
      'no-unused-vars': 'off', // Use TypeScript version instead

      // ESM specific rules
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // TypeScript handles this

      // SonarJS rules
      'sonarjs/cognitive-complexity': ['error', 15], // Max complexity of 15
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/prefer-while': 'error',
    },
  },

  // Test TypeScript files configuration
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.test.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
      sonarjs: sonarjs,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',

      // General JavaScript rules
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off', // Allow console in tests
      'no-unused-vars': 'off', // Use TypeScript version instead

      // ESM specific rules
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // TypeScript handles this

      // SonarJS rules (relaxed for tests)
      'sonarjs/cognitive-complexity': ['warn', 20], // More lenient for tests
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }], // More lenient for tests
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/no-identical-expressions': 'warn',
      'sonarjs/no-redundant-boolean': 'warn',
      'sonarjs/no-small-switch': 'warn',
      'sonarjs/no-unused-collection': 'warn',
      'sonarjs/no-use-of-empty-return-value': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
      'sonarjs/prefer-while': 'warn',
    },
  },

  // Prettier config (must be last to override other rules)
  prettierConfig,
];
