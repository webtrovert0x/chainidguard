import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load all env variables regardless of prefix from .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose REOWN_ID without needing VITE_ prefix
      'process.env.REOWN_ID': JSON.stringify(env.REOWN_ID || ''),
      'process.env.CONTRACT_ADDRESS': JSON.stringify(env.CONTRACT_ADDRESS || ''),
    },
    server: {
      port: 3000,
      open: false,
    },
  };
});

