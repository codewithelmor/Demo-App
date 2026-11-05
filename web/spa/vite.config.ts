import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vitest/config'

/** Drops the Google Fonts @import that Bootswatch themes carry; the CSP (style-src 'self') would block it. */
function stripRemoteFonts(): Plugin {
  return {
    name: 'strip-remote-fonts',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('bootswatch') || !id.endsWith('.css')) return null
      return code.replace(/@import url\(https:\/\/fonts\.googleapis\.com[^)]*\);?/g, '')
    },
  }
}

// In development the BFF (dotnet run, http://localhost:5080) is the only back end the browser sees.
const bff = 'http://localhost:5080'

export default defineConfig({
  // React Compiler memoizes components automatically (React Compiler 1.0, through Babel).
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), stripRemoteFonts()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // The build without the auto-injected <style> (blocked by the CSP); the CSS is imported in main.tsx.
      { find: /^sweetalert2$/, replacement: 'sweetalert2/dist/sweetalert2.esm.js' },
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    // Same origin in development: Vite forwards /api and /bff to the BFF. No CSP on the dev server.
    proxy: { '/api': { target: bff }, '/bff': { target: bff } },
  },
  build: {
    // Plain SPA output; the Dockerfile copies dist/ into the BFF wwwroot.
    outDir: 'dist',
    emptyOutDir: true,
    // No public source maps.
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
