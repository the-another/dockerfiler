import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'output/', 'tests/', '**/*.d.ts', '**/*.config.*'],
    },
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['node_modules/', 'dist/', 'output/'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
