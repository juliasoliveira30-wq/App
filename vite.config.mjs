import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  envDir: '.',
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
});


