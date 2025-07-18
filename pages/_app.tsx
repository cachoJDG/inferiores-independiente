"use client"

import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { useState } from "react"

export default function MyApp({ Component, pageProps }: AppProps) {
    // Create a new supabase browser client on every first render.
    const [supabaseClient] = useState(() => createPagesBrowserClient())

    return (
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
            <Component {...pageProps} />
        </SessionContextProvider>
    )
}
