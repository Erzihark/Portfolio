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
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-libs-main': ['image-preloader', 'mitt', 'promise-defer', 'vue']
        },
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
    commonjsOptions: {
      include: []
    }
  },
  optimizeDeps: {
    disabled: false
  },
  server: {
    https: true
  }
});
