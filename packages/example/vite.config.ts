import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // enables hot reload for use-file-picker package
    exclude: ['use-file-picker'],
  },
});
