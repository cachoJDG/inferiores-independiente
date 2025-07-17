// components/AddPlayerModal.tsx
'use client'

import { useState } from 'react'

type Props = {
    onClose: () => void
    onCreated: () => void
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

export default function AddPlayerModal({ onClose, onCreated }: Props) {
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [position, setPosition] = useState('')
    const [description, setDescription] = useState('')
    const [birthday, setBirthday] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [error, setError] = useState<string>()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validación rápida: al menos una categoría
        if (selectedCategories.length === 0) {
            setError('Debe seleccionar al menos una categoría')
            return
        }

        const res = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                surname,
                position: Number(position),
                description,
                birthday,
                categories: selectedCategories,
            }),
        })
        const json = await res.json()
        if (!res.ok) {
            setError(json.error || 'Error inesperado')
        } else {
            onCreated()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Agregar Jugador</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        Nombre
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </label>

                    <label className="block">
                        Apellido
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={surname}
                            onChange={e => setSurname(e.target.value)}
                            required
                        />
                    </label>

                    <label className="block">
                        Posición
                        <input
                            type="number"
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                            required
                        />
                    </label>

                    <label className="block">
                        Categorías
                        <select
                            multiple
                            value={selectedCategories}
                            onChange={e => {
                                const opts = Array.from(e.target.selectedOptions).map(o => o.value)
                                setSelectedCategories(opts)
                            }}
                            className="w-full h-28 border rounded px-2 py-1 mt-1 bg-white"
                            required
                        >
                            {ALL_CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="capitalize">
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Mantén Ctrl/Cmd para seleccionar varias.
                        </p>
                    </label>

                    <label className="block">
                        Descripción
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </label>

                    <label className="block">
                        Fecha de Nacimiento
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={birthday}
                            onChange={e => setBirthday(e.target.value)}
                            required
                        />
                    </label>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-ind-blue text-white rounded"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
