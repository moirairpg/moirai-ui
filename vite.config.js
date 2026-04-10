import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendHost = env.BACKEND_HOST || 'localhost'
  const backendPort = env.BACKEND_PORT || 8080

  return {
    plugins: [react()],
    server: {
      host: env.HOST || '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 5173,
      proxy: {
        '/ws': {
          target: `ws://${backendHost}:${backendPort}`,
          ws: true,
          changeOrigin: true,
        },
        '/api': {
          target: `http://${backendHost}:${backendPort}`,
          changeOrigin: true,
          rewrite: (path) => path.replace('/api', ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  }
})
