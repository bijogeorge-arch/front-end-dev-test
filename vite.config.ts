import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Use jsdom to simulate a browser environment for React component tests
    environment: 'jsdom',
    // Import jest-dom matchers globally (e.g. toBeInTheDocument, toHaveClass)
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
});
