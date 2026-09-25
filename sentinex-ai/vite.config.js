import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'nexus-ai-social-media-analytics-production.up.railway.app'
    ]
  }
})