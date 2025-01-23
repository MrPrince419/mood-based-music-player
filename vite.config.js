export default {
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        '@tensorflow/tfjs',
        '@tensorflow-models/face-detection',
        '@tensorflow-models/face-landmarks-detection'
      ]
    }
  },
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      '@tensorflow-models/face-detection',
      '@tensorflow-models/face-landmarks-detection'
    ]
  }
}
