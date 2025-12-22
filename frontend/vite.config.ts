import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // increase warning threshold slightly; real fix is manualChunks below
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
            if (id.includes('recharts')) return 'vendor-recharts'
            if (id.includes('framer-motion') || id.includes('lucide-react')) return 'vendor-animations'
            if (id.includes('axios')) return 'vendor-axios'
            // fallback for other node_modules
            return 'vendor'
          }
        },
      },
    },
  },
})
