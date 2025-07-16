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
}

interface Props {
    players: Player[]
    year: string
    error?: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const year = params?.year as string

    // Llamamos a nuestra API interna:
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/players/${year}`)
    const json = await res.json()

    if (!res.ok) {
        return { props: { players: [], year, error: json.error || 'Error desconocido' } }
    }
    return { props: { players: json, year } }
}

export default function CategoryPage({ players, year, error }: Props) {
    return (
        <>
            <Head>
                <title>Jugadores {year} – Paladar Negro</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className="min-h-screen bg-black text-red-100 p-8">
                <h1 className="text-4xl font-bold mb-4 text-red-500">Jugadores de {year}</h1>

                {error && (
                    <p className="mb-4 text-red-400">Error cargando datos: {error}</p>
                )}

                {!error && players.length === 0 && (
                    <p className="mb-4 text-gray-400">No hay jugadores para este año.</p>
                )}

                <ul className="space-y-3 mb-8">
                    {players.map((p) => (
                        <li
                            key={p.id}
                            className="border border-red-700 rounded-lg p-4 bg-red-900/20"
                        >
                            <p>
                                <strong>
                                    {p.name} {p.surname}
                                </strong>{' '}
                                – Posición: {p.position}
                            </p>
                            <p className="text-sm text-gray-300">Nacimiento: {p.birthday}</p>
                            <p className="mt-1">{p.description}</p>
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
