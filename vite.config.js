import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Força o empacotamento no desenvolvimento do cliente
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  // Mantém a proteção caso use recursos de servidor
  ssr: {
    noExternal: ['@supabase/supabase-js']
  },
  build: {
    rollupOptions: {
      // Garante que o Supabase NÃO seja tratado como módulo externo no build final
      external: []
    }
  }
})
