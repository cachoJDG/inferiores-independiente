'use client'

import { useState, useEffect } from 'react'

type Props = {
    onClose: () => void
    onCreated: () => void
}

type PlayerInput = {
    name: string
    surname: string
    position: number
    description: string
    birthday: string
    categories: string[]
    agentId: number | null
}

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

export default function AddPlayerModal({ onClose, onCreated }: Props) {
    const [player, setPlayer] = useState<PlayerInput>({
        name: '',
        surname: '',
        position: 0,
        description: '',
        birthday: '',
        categories: [],
        agentId: null,
    })
    const [agents, setAgents] = useState<{ id: number; name: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Traer lista de agentes
    useEffect(() => {
        fetch('/api/agents')
            .then(r => r.json())
            .then(data => setAgents(data))
            .catch(() => setError('No se pudo cargar representantes'))
    }, [])

    const toggleCategory = (cat: string) => {
        setPlayer(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat],
        }))
    }

    const handleSubmit = async () => {
        if (player.categories.length === 0) {
            setError('Debe seleccionar al menos una categoría')
            return
        }
        if (player.agentId == null) {
            setError('Debe elegir un representante')
            return
        }

        console.log("🛠️ [AddPlayerModal] payload:", {
                 name: player.name,
                 surname: player.surname,
                 position: player.position,
                 description: player.description,
                 birthday: player.birthday,
                 categories: player.categories,
                 agent_id: player.agentId,
               })

        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: player.name,
                    surname: player.surname,
                    position: player.position,
                    description: player.description,
                    birthday: player.birthday,
                    categories: player.categories,
                    agent_id: player.agentId,
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error inesperado')
            onCreated()
            onClose()
        } catch (err: any) {
            console.error("🔴 [players] Unexpected error:", err)
            console.error(err.stack)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="max-w-md w-full bg-gray-900 border border-red-600 rounded-2xl p-8 shadow-lg shadow-red-600/20 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Agregar Jugador</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-red-400 hover:text-red-500 text-sm font-medium"
                    >
                        ×
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="space-y-4">
                    {/* Nombre / Apellido */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Nombre</label>
                            <input
                                type="text"
                                value={player.name}
                                onChange={e => setPlayer({ ...player, name: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Apellido</label>
                            <input
                                type="text"
                                value={player.surname}
                                onChange={e => setPlayer({ ...player, surname: e.target.value })}
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
                                value={player.position}
                                onChange={e => setPlayer({ ...player, position: Number(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Fecha Nac.</label>
                            <input
                                type="date"
                                value={player.birthday}
                                onChange={e => setPlayer({ ...player, birthday: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>
                    </div>

                    {/* Representante */}
                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Representante</label>
                        <select
                            value={player.agentId ?? ""}
                            onChange={e =>
                                setPlayer(p => ({ ...p, agentId: Number(e.target.value) }))
                            }
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                        >
                            <option value="" disabled>Seleccioná un agente</option>
                            {agents.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Categorías */}
                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Categorías</label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_CATEGORIES.map(cat => {
                                const sel = player.categories.includes(cat)
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => toggleCategory(cat)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            sel
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
                            value={player.description}
                            onChange={e => setPlayer({ ...player, description: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none"
                        />
                    </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
