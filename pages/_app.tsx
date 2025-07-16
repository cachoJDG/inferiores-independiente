// pages/_app.tsx
import '@/styles/globals.css'              // ← tu Tailwind aquí
import type { AppProps } from 'next/app'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabaseClient'

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SessionContextProvider
            supabaseClient={supabase}
            initialSession={(pageProps as any).initialSession}
        >
            <Component {...pageProps} />
        </SessionContextProvider>
    )
}
