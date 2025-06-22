import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Entry point for the widget
      entry: 'src/main.tsx',
      name: 'AIChatbotWidget',
      // Output filename
      fileName: (format) => `chatbot-widget.${format}.js`,
      // Output formats
      formats: ['umd']
    },
    rollupOptions: {
      // Bundle React and React-DOM instead of treating them as external
      // This ensures the widget is completely self-contained
      external: [],
      output: {
        // Global variable name for UMD build
        globals: {}
      }
    },
    // Ensure the bundle is optimized
    minify: 'terser',
    // Generate source maps for debugging
    sourcemap: true,
    // Target modern browsers
    target: 'es2020'
  },
  // Development server configuration
  server: {
    port: 3000,
    open: true
  }
})
