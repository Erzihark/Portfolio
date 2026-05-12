import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('a-')
        }
      }
    }),

    basicSsl()
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  optimizeDeps: {
    exclude: ['aframe', 'three']
  },

  build: {
    chunkSizeWarningLimit: 1000,

    commonjsOptions: {
      include: []
    },

    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },

  server: {
    https: true
  }
});
