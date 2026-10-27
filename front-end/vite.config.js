import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,
    watch: {
      ignored: ['**/back-end/**'],
    },
    proxy: {
      '/uploads': {target:apiTarget,changeOrigin:true},
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
