import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  
  return {
    plugins: [react()],
    define: isDev ? {
      // In development, let Vite load environment variables naturally
      'process.env': JSON.stringify({}),
    } : {
      // In production build, define static values for embedding
      'process.env': JSON.stringify({}),
      'import.meta.env.DEV': JSON.stringify(false),
      'import.meta.env.PROD': JSON.stringify(true),
      'import.meta.env.MODE': JSON.stringify('production'),
      // Set default values for Vite environment variables in production
      'import.meta.env.VITE_API_URL': JSON.stringify(''),
      'import.meta.env.VITE_API_KEY': JSON.stringify(''),
      'import.meta.env.VITE_DEBUG_MODE': JSON.stringify('false'),
      'import.meta.env.VITE_ENABLE_HISTORY': JSON.stringify('false'),
    },
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
  }
})
