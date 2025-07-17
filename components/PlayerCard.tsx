// components/PlayerCard.tsx
'use client'

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
    player: Player
}

export default function PlayerCard({ player }: Props) {
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

    return (
        <div className="bg-gray-900 border border-red-600 rounded-lg p-6 hover:shadow-lg hover:shadow-red-600/50 transition-all">
            <h3 className="text-2xl font-semibold text-white mb-2 border-b border-red-600 pb-1">
                {player.name} {player.surname}
            </h3>

            <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <span className="px-2 py-1 bg-gray-800 text-gray-200 rounded">
          Posición: <span className="font-medium text-white">{player.position}</span>
        </span>
                {(player.categories ?? []).length > 0 ? (
                    player.categories!.map((cat) => (
                        <span
                            key={cat}
                            className="px-2 py-1 bg-red-600/20 text-red-300 rounded capitalize"
                        >
              {cat}
            </span>
                    ))
                ) : (
                    <span className="px-2 py-1 bg-gray-800 text-gray-500 rounded">
            Sin categorías
          </span>
                )}
                <span className="px-2 py-1 bg-gray-800 text-gray-200 rounded">
          <span className="font-medium text-white">{calculateAge(player.birthday)}</span> años
        </span>
            </div>

            <p className="text-gray-300 text-sm">{player.description || 'Sin descripción.'}</p>

            <div className="mt-4 text-gray-500 text-xs">
                Nacido el: <span className="text-gray-300">{formatDate(player.birthday)}</span>
            </div>
        </div>
    )
}
