// pages/players/[id]/edit.tsx
'use client'

import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const ALL_CATEGORIES = [
    'reserva',
    'cuarta',
    'quinta',
    'sexta',
    'septima',
    'octava',
    'novena',
    'decima',
]

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
    player: Player | null
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const id = Number(params?.id)
    const { data: rawPlayer, error } = await supabase
        .from('Players')
        .select(`
      id,
      name,
      surname,
      position,
      description,
      birthday,
      player_categories (
        category:categories ( name )
      )
    `)
        .eq('id', id)
        .maybeSingle()

    if (error || !rawPlayer) {
        return { notFound: true }
    }

    // Extraemos nombres de categorías, manejando que pc.category pueda ser array
    const categories: string[] = (rawPlayer.player_categories || []).flatMap((pc: any) => {
        const catField = pc.category
        if (Array.isArray(catField)) {
            return catField.map((c: any) => c.name as string)
        } else if (catField?.name) {
            return [catField.name as string]
        }
        return []
    })

    return {
        props: {
            player: {
                id: rawPlayer.id,
                name: rawPlayer.name,
                surname: rawPlayer.surname,
                position: rawPlayer.position,
                description: rawPlayer.description,
                birthday: rawPlayer.birthday,
                categories,
            },
        },
    }
}

export default function EditPlayerPage({ player }: Props) {
    const router = useRouter()
    if (!player) return null

    const [edited, setEdited] = useState<Player>({
        ...player,
        categories: player.categories ?? [],
    })
    const [loading, setLoading] = useState(false)

    const toggleCategory = (cat: string) => {
        setEdited((prev) => ({
            ...prev,
            categories: prev.categories!.includes(cat)
                ? prev.categories!.filter(c => c !== cat)
                : [...prev.categories!, cat],
        }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const payload: any = { ...edited }
            delete payload.id
            if (!payload.categories || payload.categories.length === 0) {
                delete payload.categories
            }

            const res = await fetch(`/api/players/${player.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Error al guardar')
            router.push(`/players/${player.id}`)
        } catch (err) {
            console.error(err)
            alert('No se pudieron guardar los cambios')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Head>
                <title>Editar {player.name} {player.surname}</title>
            </Head>

            <main className="bg-gray-800 min-h-screen py-12 px-6">
                <div className="max-w-md mx-auto bg-gray-900 border border-red-600 rounded-2xl p-8 shadow-lg shadow-red-600/20 space-y-6">
                    {/* Controls */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => router.back()}
                            className="text-red-400 hover:text-red-500 text-sm font-medium"
                        >
                            ← Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white">
                        Editar {player.name} {player.surname}
                    </h1>

                    {/* Form */}
                    <div className="space-y-4">
                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={edited.name}
                                    onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Apellido</label>
                                <input
                                    type="text"
                                    value={edited.surname}
                                    onChange={(e) => setEdited({ ...edited, surname: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                                />
                            </div>
                        </div>

                        {/* Posición / Fecha */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Posición</label>
                                <input
                                    type="number"
                                    value={edited.position}
                                    onChange={(e) =>
                                        setEdited({ ...edited, position: Number(e.target.value) })
                                    }
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Fecha Nac.</label>
                                <input
                                    type="date"
                                    value={edited.birthday}
                                    onChange={(e) =>
                                        setEdited({ ...edited, birthday: e.target.value })
                                    }
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                                />
                            </div>
                        </div>

                        {/* Categorías: pills toggles */}
                        <div>
                            <label className="block text-gray-300 text-sm mb-2">Categorías</label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_CATEGORIES.map((cat) => {
                                    const selected = edited.categories!.includes(cat)
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                selected
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Descripción</label>
                            <textarea
                                rows={4}
                                value={edited.description}
                                onChange={(e) =>
                                    setEdited({ ...edited, description: e.target.value })
                                }
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
