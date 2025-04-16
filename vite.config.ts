import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), dts({ tsconfigPath: './tsconfig.app.json', rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'VueIsotope',
      fileName: 'vue3-isotope'
    },
    rollupOptions: {
      external: ['vue', 'isotope-layout', '@types/isotope-layout'],
      output: {
        globals: { vue: 'Vue', 'isotope-layout': 'Isotope' }
      }
    },
    // Optional: Generate source maps for debugging
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
