// components/PlayerCard.tsx
'use client'

import { useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'

type Player = {
    id: number
    name: string
    surname: string
    position: number
    description: string
    birthday: string
    // ahora opcional porque puede venir undefined del API
    categories?: string[]
}

interface PlayerCardProps {
    player: Player
    onUpdate?: (updatedPlayer: Player) => void
    onDelete?: (playerId: number) => void
}

const ALL_CATEGORIES = [
    'reserva',
    'cuarta',
    'quinta',
    'sexta',
    'séptima',
    'octava',
    'novena',
    'décima',
]

export default function PlayerCard({
                                       player,
                                       onUpdate,
                                       onDelete,
                                   }: PlayerCardProps) {
    const session = useSession()
    const canEdit = !!session

    // inicializo categories siempre como array
    const initial: Player = {
        ...player,
        categories: player.categories ?? [],
    }

    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editedPlayer, setEditedPlayer] = useState<Player>(initial)

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('es-ES')

    const calculateAge = (birthday: string) => {
        const today = new Date()
        const birth = new Date(birthday)
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
        return age
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            // Preparo el payload sin id y sin categories vacías
                       const payload: any = { ...editedPlayer }
                           delete payload.id
                           if (Array.isArray(payload.categories) && payload.categories.length === 0) {
                             delete payload.categories
                           }
                       const res = await fetch(`/api/players/${player.id}`, {
                               method: 'PUT',
                               headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify(payload),
                           })
            if (!res.ok) throw new Error('Error al actualizar el jugador')
            const updated: Player = await res.json()
            onUpdate?.(updated)
            setIsEditing(false)
        } catch (err) {
            console.error(err)
            alert('Error al guardar los cambios')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setEditedPlayer(initial)
        setIsEditing(false)
    }

    const handleDelete = async () => {
        if (!confirm('¿Seguro que quieres eliminar este jugador?')) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/players/${player.id}`, {
                method: 'DELETE',
            })
            if (!res.ok) throw new Error('Error al eliminar el jugador')
            onDelete?.(player.id)
        } catch (err) {
            console.error(err)
            alert('Error al eliminar el jugador')
        } finally {
            setIsLoading(false)
        }
    }

    // siempre trabajo con un array no-null
    const readOnlyCategories = player.categories ?? []
    const editingCategories = editedPlayer.categories ?? []

    return (
        <div className="bg-gradient-to-r from-ind-red/20 to-ind-blue/20 border border-ind-red/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            {isEditing && canEdit ? (
                // --- Formulario de edición ---
                <div className="space-y-4">
                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={editedPlayer.name}
                                onChange={(e) =>
                                    setEditedPlayer({ ...editedPlayer, name: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Apellido</label>
                            <input
                                type="text"
                                value={editedPlayer.surname}
                                onChange={(e) =>
                                    setEditedPlayer({ ...editedPlayer, surname: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                    </div>

                    {/* Posición, Categorías Múltiples y Fecha de Nac */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Posición</label>
                            <input
                                type="number"
                                value={editedPlayer.position}
                                onChange={(e) =>
                                    setEditedPlayer({
                                        ...editedPlayer,
                                        position: parseInt(e.target.value),
                                    })
                                }
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Categorías</label>
                            <select
                                multiple
                                value={editingCategories}
                                onChange={(e) => {
                                    const opts = Array.from(e.target.selectedOptions).map((o) => o.value)
                                    setEditedPlayer({ ...editedPlayer, categories: opts })
                                }}
                                className="w-full h-24 px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            >
                                {ALL_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="capitalize">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                Mantén Ctrl/Cmd para seleccionar varias.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                value={editedPlayer.birthday}
                                onChange={(e) =>
                                    setEditedPlayer({ ...editedPlayer, birthday: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={editedPlayer.description}
                            onChange={(e) =>
                                setEditedPlayer({ ...editedPlayer, description: e.target.value })
                            }
                            rows={3}
                            className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red resize-none"
                        />
                    </div>

                    {/* Botones Guardar/Cancelar */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                // --- Vista solo lectura ---
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {player.name} {player.surname}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                <span className="bg-ind-red/30 px-2 py-1 rounded">
                  Posición: {player.position}
                </span>
                                {readOnlyCategories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="bg-indigo-600/30 px-2 py-1 rounded capitalize"
                                    >
                    {cat}
                  </span>
                                ))}
                                <span className="bg-ind-black/30 px-2 py-1 rounded">
                  {calculateAge(player.birthday)} años
                </span>
                            </div>
                        </div>

                        {canEdit && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-1 bg-ind-blue hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-ind-red/20 pt-4">
                        <p className="text-gray-300 leading-relaxed">
                            {player.description || 'Sin descripción disponible'}
                        </p>
                    </div>

                    <div className="text-xs text-gray-400 border-t border-ind-red/10 pt-2">
                        Fecha de nacimiento: {formatDate(player.birthday)}
                    </div>
                </div>
            )}
        </div>
    )
}
