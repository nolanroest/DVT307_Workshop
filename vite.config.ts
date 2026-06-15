/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist'
    },
    base: mode === 'production' ? '/' : `/app`,
    server: {
      port: 8081,
      allowedHosts: mode === 'production' ? ['*'] : true
    }
  };
});