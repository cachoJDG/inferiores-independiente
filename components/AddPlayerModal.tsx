// components/AddPlayerModal.tsx
'use client'

import { useState } from 'react'

type Props = {
    onClose: () => void
    onCreated: () => void
}

const categories = [
    'reserva',
    'cuarta',
    'quinta',
    'sexta',
    'septima',
    'octava',
    'novena',
]

export default function AddPlayerModal({ onClose, onCreated }: Props) {
    const [name, setName] = useState('')
    // … declara aquí surname, position, category, description, birthday y error …
    const [surname, setSurname] = useState('')
    const [position, setPosition] = useState('')
    const [category, setCategory] = useState(categories[0])
    const [description, setDescription] = useState('')
    const [birthday, setBirthday] = useState('')
    const [error, setError] = useState<string>()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                surname,
                position: Number(position),
                category,
                description,
                birthday,
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
                    <label>
                        Nombre<br/>
                        <input
                            className="w-full border rounded px-2 py-1"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Apellido<br/>
                        <input
                            className="w-full border rounded px-2 py-1"
                            value={surname}
                            onChange={e => setSurname(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Posición<br/>
                        <input
                            type="number"
                            className="w-full border rounded px-2 py-1"
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                            required
                        />
                    </label>
                    <label className="block">
                        Categoría
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full border rounded px-2 py-1 mt-1"
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Descripción<br/>
                        <input
                            className="w-full border rounded px-2 py-1"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Fecha de Nacimiento<br/>
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-1"
                            value={birthday}
                            onChange={e => setBirthday(e.target.value)}
                            required
                        />
                    </label>
                    <div className="flex justify-end space-x-2">
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
