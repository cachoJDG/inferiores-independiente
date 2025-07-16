// pages/year/[year].tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'   // ← importa el cliente

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
    year: string
    error?: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const year = params?.year as string

    // 🚀 Consultamos Supabase directamente
    const from = `${year}-01-01`
    const to   = `${year}-12-31`
    const { data: players, error } = await supabase
        .from<Player>('Players')
        .select('*')
        .gte('birthday', from)
        .lte('birthday', to)

    if (error) {
        return { props: { players: [], year, error: error.message } }
    }

    return { props: { players: players ?? [], year } }
}

export default function YearPage({ players, year, error }: Props) {
    return (
        <>
            <Head>
                <title>{`Jugadores ${year} – Movimiento Paladar Negro`}</title>
                <meta name="description" content={`Jugadores nacidos en ${year}`} />
            </Head>
            <main className="min-h-screen bg-black text-white p-8">
                <h1 className="text-4xl font-bold mb-4">Jugadores nacidos en {year}</h1>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
                        <p className="text-red-200">Error: {error}</p>
                    </div>
                )}

                {!error && players.length === 0 && (
                    <p className="text-gray-400 mb-8">
                        No se encontraron jugadores para el año {year}.
                    </p>
                )}

                <ul className="space-y-4">
                    {players.map((p) => (
                        <li key={p.id} className="border rounded p-4 bg-gray-800">
                            <strong>{p.name} {p.surname}</strong> – Posición {p.position}<br/>
                            <small className="text-gray-400">Nacido: {p.birthday}</small><br/>
                            <p className="mt-1">{p.description}</p>
                        </li>
                    ))}
                </ul>

                <Link
                    href="/"
                    className="mt-8 inline-block px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    ← Volver al inicio
                </Link>
            </main>
        </>
    )
}
