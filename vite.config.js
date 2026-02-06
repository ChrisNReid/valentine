import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to the GitHub Pages project path: https://<user>.github.io/<repo>/
  // For this repo ("valentine"), the URL will be: https://chrisnreid.github.io/valentine/
  base: '/valentine/',
})
