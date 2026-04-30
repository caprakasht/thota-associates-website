import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import buildFeedAndSitemap from './scripts/build-feed-and-sitemap.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildFeedAndSitemap()],
})