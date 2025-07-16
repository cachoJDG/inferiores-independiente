"use client"

import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import PlayerCard from "../../components/PlayerCard"

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
        return { props: { players: [], cat, error: json.error || "Error desconocido" } }
    }
    return { props: { players: json, cat } }
}

export default function CategoryPage({ players: initialPlayers, cat, error }: Props) {
    const [players, setPlayers] = useState(initialPlayers)

    const handlePlayerUpdate = (updatedPlayer: Player) => {
        setPlayers(players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)))
    }

    const handlePlayerDelete = (playerId: number) => {
        setPlayers(players.filter((p) => p.id !== playerId))
    }

    return (
        <>
            <Head>
                <title>{`Categoría ${cat} – Movimiento Paladar Negro`}</title>
                <meta name="description" content={`Jugadores de la categoría ${cat}`} />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-ind-black via-ind-blue to-ind-red text-white px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold mb-4 capitalize">Categoría {cat}</h1>
                        <p className="text-xl opacity-80">
                            {players.length} {players.length === 1 ? "jugador" : "jugadores"} en esta categoría
                        </p>
                    </header>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
                            <p className="text-red-200">Error: {error}</p>
                        </div>
                    )}

                    {!error && players.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-400 mb-4">No hay jugadores en esta categoría aún.</p>
                            <Link
                                href="/"
                                className="inline-block px-6 py-3 bg-ind-red hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Agregar Jugador
                            </Link>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                        {players.map((player) => (
                            <PlayerCard key={player.id} player={player} onUpdate={handlePlayerUpdate} onDelete={handlePlayerDelete} />
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
