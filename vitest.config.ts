import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.{mjs,ts}'],
    testTimeout: 60000,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js'],
  },
});