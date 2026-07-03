import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is the dev server + bundler. `npm run dev` starts a local web server
// (default http://localhost:5173) that live-reloads when you save a file.
export default defineConfig({
  plugins: [react()],
  server: { open: true },
  // Allow access via tunnels (cloudflared/ngrok) when sharing a live preview.
  preview: { allowedHosts: true },
  // Relative asset paths so the built site works from any host or subfolder
  // (Netlify, Vercel, GitHub Pages, a drag-and-drop deploy, etc.).
  base: './',
});
