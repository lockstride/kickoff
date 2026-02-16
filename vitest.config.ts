import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/static/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/integration/**/*.integration.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
