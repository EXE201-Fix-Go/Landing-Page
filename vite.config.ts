import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // '/' cho tên miền riêng / Cloudflare Pages. GitHub Pages dạng dự án: đặt VITE_BASE=/Landing-Page/ lúc build.
  base: process.env.VITE_BASE?.trim() || '/',
  plugins: [react()],
});
