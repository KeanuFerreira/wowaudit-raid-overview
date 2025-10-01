import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
    return {
        define: {
            __APP_ENV__: import.meta.env.VITE_VERCEL_ENV,
            __WOWAUDIT_CREDENTIAL__: import.meta.env.WOWAUDIT_CREDENTIAL,
            __WOWAUDIT_API_URL__: import.meta.env.WOWAUDIT_API_URL
        },
        plugins: [react()],
    };
});
