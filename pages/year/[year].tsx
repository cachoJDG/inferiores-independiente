// pages/year/[year].tsx
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
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
    category: string
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

export default function YearPage({ players: initialPlayers, year, error }: Props) {
    const [players, setPlayers] = useState(initialPlayers)

    const handlePlayerUpdate = (updatedPlayer: Player) => {
        setPlayers((prev) =>
            prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
        )
    }

    const handlePlayerDelete = (playerId: number) => {
        setPlayers((prev) => prev.filter((p) => p.id !== playerId))
    }

    return (
        <>
            <Head>
                <title>Jugadores {year} – Movimiento Paladar Negro</title>
                <meta
                    name="description"
                    content={`Listado de jugadores nacidos en ${year}`}
                />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-ind-black via-ind-blue to-ind-red text-white px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Login/logout form */}
                    <div className="max-w-sm mx-auto mb-8">
                        <AuthForm />
                    </div>

                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold mb-4">
                            Jugadores de {year}
                        </h1>
                        <p className="text-xl opacity-80">
                            {players.length}{' '}
                            {players.length === 1 ? 'jugador' : 'jugadores'} nacidos en {year}
                        </p>
                    </header>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
                            <p className="text-red-200">Error: {error}</p>
                        </div>
                    )}

                    {!error && players.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-400 mb-4">
                                No hay jugadores registrados para el año {year}.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                        {players.map((player) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                onUpdate={handlePlayerUpdate}
                                onDelete={handlePlayerDelete}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-ind-blue hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            ← Volver al inicio
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}
