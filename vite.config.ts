import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    // Only use the repo name as base in production (GitHub Pages)
    // In dev/preview, use root '/' to avoid path issues
    base: mode === 'production' ? '/ShatteredDogma/' : '/',
  }
})