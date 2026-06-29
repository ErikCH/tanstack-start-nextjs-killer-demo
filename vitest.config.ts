import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// Standalone Vitest config so tests don't pull in the full TanStack Start
// build pipeline (server fn transforms, devtools, etc.). Keeps `npm test`
// fast and isolated. Run with `npm test`.
export default defineConfig({
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
