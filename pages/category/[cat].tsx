// pages/equipo/[cat].tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

type Player = {
    id: number
    name: string
    surname: string
    position: number
    description: string
    birthday: string
    category: string
}

interface Props {
    players: Player[]
    cat: string
    error?: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const cat = params?.cat as string
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/players/category/${cat}`
    )
    const json = await res.json()
    if (!res.ok) {
        return { props: { players: [], cat, error: json.error || 'Error desconocido' } }
    }
    return { props: { players: json, cat } }
}

export default function TeamPage({ players, cat, error }: Props) {
    return (
        <>
            <Head>
                <title>{`Categoría ${cat} – Paladar Negro`}</title>
            </Head>
            <main className="min-h-screen bg-ind-black text-red-100 p-8">
                <h1 className="text-4xl font-bold text-ind-red mb-6 capitalize">
                    Categoría {cat}
                </h1>

                {error && <p className="text-red-400">{error}</p>}
                {!error && players.length === 0 && <p>No hay jugadores en esta categoría.</p>}

                <ul className="space-y-4">
                    {players.map((p) => (
                        <li key={p.id} className="p-4 bg-ind-red/10 rounded-lg">
                            <p>
                                <strong>{p.name} {p.surname}</strong> – Posición {p.position}
                            </p>
                            <p className="text-sm text-gray-300">{p.description}</p>
                        </li>
                    ))}
                </ul>

                <Link href="/" className="mt-8 inline-block text-red-400 hover:underline">
                    ← Volver
                </Link>
            </main>
        </>
    )
}
