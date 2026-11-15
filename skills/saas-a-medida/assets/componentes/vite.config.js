import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: { port: 5191 },
  test: { environment: 'jsdom', css: false, setupFiles: ['./test/preparar.js'] },
});
