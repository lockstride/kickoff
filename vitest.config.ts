import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/static/**/*.test.ts', 'tests/e2e/**/*.test.ts'],
    exclude: ['tests/e2e/**/*.e2e.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
