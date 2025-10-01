import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  return {
    define: {
      __APP_ENV__: process.env.VITE_VERCEL_ENV,
      __WOWAUDIT_CREDENTIAL__: process.env.WOWAUDIT_CREDENTIAL,
        __WOWAUDIT_API_URL__: process.env.WOWAUDIT_API_URL
    },
    plugins: [react()],
  };
});
