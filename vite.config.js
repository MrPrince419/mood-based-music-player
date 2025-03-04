import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          'tensorflow': ['@tensorflow/tfjs'],
          'face-models': [
            '@tensorflow-models/face-detection',
            '@tensorflow-models/face-landmarks-detection'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@tensorflow/tfjs-node']
  }
});