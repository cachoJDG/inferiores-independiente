// pages/_app.tsx
import type { AppProps } from 'next/app'
import '../styles/globals.css'  // tu Tailwind con rojo/negro

export default function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
