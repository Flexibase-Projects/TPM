import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Coolify: no container a app escuta na porta 3000 (Caddy). Mapeie no Coolify: Port Mappings 8090:3000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8090,
    host: true, // Permite acesso de outros dispositivos na rede local
    open: true
  },
  preview: {
    port: 8090 // mesmo que o host no Coolify para testar localmente
  }
})
