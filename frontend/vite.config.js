import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      "Content-Security-Policy": "frame-ancestors 'none'",
    },
  },
  preview: {
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': [
        "default-src 'self'",
        "base-uri 'self'",
        'block-all-mixed-content',
        // No inline/eval in production preview
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' http://localhost:8800",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "frame-ancestors 'none'",
      ].join('; '),
    },
  },
})
