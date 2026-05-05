import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this app from the repository subpath in production.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
