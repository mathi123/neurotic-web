import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      reportOnFailure: true,
      exclude: ['node_modules', 'app/storage/client', '.next', 'tests', '**.config.**', 'middleware.ts', 'app/app'],
    },
  },
});
