"use client"

import { useState } from "react"

type Player = {
    id: number
    name: string
    surname: string
    position: number
    description: string
    birthday: string
    category: string
}

interface PlayerCardProps {
    player: Player
    onUpdate?: (updatedPlayer: Player) => void
    onDelete?: (playerId: number) => void
}

export default function PlayerCard({ player, onUpdate, onDelete }: PlayerCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editedPlayer, setEditedPlayer] = useState(player)

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/players/${player.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedPlayer),
            })

            if (!response.ok) {
                throw new Error("Error al actualizar el jugador")
            }

            const updatedPlayer = await response.json()
            onUpdate?.(updatedPlayer)
            setIsEditing(false)
        } catch (error) {
            console.error("Error:", error)
            alert("Error al guardar los cambios")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setEditedPlayer(player)
        setIsEditing(false)
    }

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/players/${player.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Error al eliminar el jugador")
            }

            onDelete?.(player.id)
        } catch (error) {
            console.error("Error:", error)
            alert("Error al eliminar el jugador")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES")
    }

    const calculateAge = (birthday: string) => {
        const today = new Date()
        const birthDate = new Date(birthday)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }

        return age
    }

    return (
        <div className="bg-gradient-to-r from-ind-red/20 to-ind-blue/20 border border-ind-red/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={editedPlayer.name}
                                onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Apellido</label>
                            <input
                                type="text"
                                value={editedPlayer.surname}
                                onChange={(e) => setEditedPlayer({ ...editedPlayer, surname: e.target.value })}
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Posición</label>
                            <input
                                type="number"
                                value={editedPlayer.position}
                                onChange={(e) => setEditedPlayer({ ...editedPlayer, position: Number.parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                            <select
                                value={editedPlayer.category}
                                onChange={(e) => setEditedPlayer({ ...editedPlayer, category: e.target.value })}
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            >
                                <option value="reserva">Reserva</option>
                                <option value="cuarta">Cuarta</option>
                                <option value="quinta">Quinta</option>
                                <option value="sexta">Sexta</option>
                                <option value="séptima">Séptima</option>
                                <option value="octava">Octava</option>
                                <option value="novena">Novena</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={editedPlayer.birthday}
                                onChange={(e) => setEditedPlayer({ ...editedPlayer, birthday: e.target.value })}
                                className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                        <textarea
                            value={editedPlayer.description}
                            onChange={(e) => setEditedPlayer({ ...editedPlayer, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-ind-black/50 border border-ind-red/30 rounded text-white focus:outline-none focus:border-ind-red resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Guardando..." : "Guardar"}
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
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {player.name} {player.surname}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                                <span className="bg-ind-red/30 px-2 py-1 rounded">Posición: {player.position}</span>
                                <span className="bg-ind-blue/30 px-2 py-1 rounded capitalize">{player.category}</span>
                                <span className="bg-ind-black/30 px-2 py-1 rounded">{calculateAge(player.birthday)} años</span>
                            </div>
                        </div>
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
                    </div>

                    <div className="border-t border-ind-red/20 pt-4">
                        <p className="text-gray-300 leading-relaxed">{player.description || "Sin descripción disponible"}</p>
                    </div>

                    <div className="text-xs text-gray-400 border-t border-ind-red/10 pt-2">
                        Fecha de nacimiento: {formatDate(player.birthday)}
                    </div>
                </div>
            )}
        </div>
    )
}
