export default {
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          tensorflow: [
            '@tensorflow/tfjs',
            '@tensorflow-models/face-detection',
            '@tensorflow-models/face-landmarks-detection'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      '@tensorflow-models/face-detection',
      '@tensorflow-models/face-landmarks-detection'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
}
