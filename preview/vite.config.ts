import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tailwindConfig from '../tailwind.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(dirname, '../src');

// Builds the real app's components as a standalone, single-file browser SPA.
// Next-specific imports are aliased to lightweight shims, and the Prisma /
// server-action data layer is swapped for a client store seeded in the browser.
export default defineConfig({
  root: dirname,
  plugins: [react(), viteSingleFile()],
  css: {
    postcss: {
      plugins: [tailwindcss(tailwindConfig as never), autoprefixer()],
    },
  },
  resolve: {
    alias: [
      // Most specific first.
      { find: /^@\/app\/actions$/, replacement: path.resolve(dirname, 'shims/actions.ts') },
      { find: /^@\/app\/auth-actions$/, replacement: path.resolve(dirname, 'shims/auth-actions.ts') },
      { find: /^@\/auth$/, replacement: path.resolve(dirname, 'shims/prisma.ts') },
      { find: /^@\/lib\/prisma$/, replacement: path.resolve(dirname, 'shims/prisma.ts') },
      { find: /^next\/link$/, replacement: path.resolve(dirname, 'shims/next-link.tsx') },
      { find: /^next\/navigation$/, replacement: path.resolve(dirname, 'shims/next-navigation.tsx') },
      { find: /^next\/dynamic$/, replacement: path.resolve(dirname, 'shims/next-dynamic.tsx') },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  build: {
    outDir: path.resolve(dirname, '../dist-preview'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
});
