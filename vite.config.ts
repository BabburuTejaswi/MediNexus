import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // In Google AI Studio preview, the iframe reverse proxy does not support WebSocket upgrades.
  // We disable HMR in AI Studio to prevent failed WebSocket connections and unhandled rejections.
  // In local VS Code development, HMR remains enabled for instant hot module reloading.
  const isAiStudio = Boolean(
    process.env.APPLET_ID ||
    (process.env.APP_URL && !process.env.APP_URL.includes('localhost') && !process.env.APP_URL.includes('127.0.0.1')) ||
    process.env.DISABLE_HMR === 'true' ||
    process.env.K_SERVICE
  );

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      hmr: !isAiStudio,
      watch: isAiStudio ? null : {},
    },
  };
});
