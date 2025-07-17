// pages/year/[year].tsx
'use client'

import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import AuthForm from '@/components/AuthForm'
import PlayerCard from '@/components/PlayerCard'
import { supabase } from '@/lib/supabaseClient'

type Player = {
    id: number
    name: string
    surname: string
    position: number
    description: string
    birthday: string
    categories?: string[]
}

interface Props {
    players: Player[]
    year: string
    error?: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const year = params?.year as string
    const from = `${year}-01-01`
    const to = `${year}-12-31`

    const { data: players, error } = await supabase
        .from('Players')
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
                <meta
                    name="description"
                    content={`Listado de jugadores nacidos en ${year}`}
                />
            </Head>

            <main className="min-h-screen bg-gray-800 text-white px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Login/logout form */}
                    <div className="max-w-sm mx-auto mb-8">
                        <AuthForm />
                    </div>

                    {/* Header */}
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold text-white mb-4">
                            {`Jugadores de ${year}`}
                        </h1>
                        <p className="text-xl text-gray-300">
                            {`${players.length} ${
                                players.length === 1 ? 'jugador' : 'jugadores'
                            } nacidos en ${year}`}
                        </p>
                    </header>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
                            <p className="text-red-200">{`Error: ${error}`}</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!error && players.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-400 mb-4">
                                {`No hay jugadores registrados para el año ${year}.`}
                            </p>
                        </div>
                    )}

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                        {players.map((player) => (
                            <Link
                                key={player.id}
                                href={`/players/${player.id}`}
                                className="block hover:scale-[1.02] transition-all"
                            >
                                <PlayerCard player={player} />
                            </Link>
                        ))}
                    </div>

                    {/* Back to home */}
                    <div className="text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            ← Volver al inicio
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}
