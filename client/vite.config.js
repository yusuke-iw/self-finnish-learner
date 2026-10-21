import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      thresholds: { statements: 90, branches: 80, functions: 80, lines: 90 },
      exclude: [
        'src/main.jsx',
        'src/setupTests.js',
        'src/**/__tests__/**',
        'src/**/*.test.{js,jsx}',
        'src/assets/**'
      ]
    }
  },
})
