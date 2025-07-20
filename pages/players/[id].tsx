// pages/players/[id].tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

type Player = {
    id: number
    name: string
    surname: string
    position: number
    description: string
    birthday: string
    categories?: string[]
    agentName?: string
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
      ),
      agent:agents ( name )
    `)
        .eq('id', id)
        .maybeSingle()

    if (error || !rawPlayer) {
        return { notFound: true }
    }

    // extraemos categorías igual que antes
    const categories: string[] = (rawPlayer.player_categories || []).flatMap((pc: any) => {
        const catField = pc.category
        if (Array.isArray(catField)) {
            return catField.map((c: any) => c.name as string)
        } else if (catField?.name) {
            return [catField.name as string]
        }
        return []
    })

    // extraemos el nombre del agente (puede venir como objeto o array de un solo elemento)
    let agentName = ''
    if (rawPlayer.agent) {
        if (Array.isArray(rawPlayer.agent)) {
            agentName = rawPlayer.agent[0]?.name ?? ''
        } else if ((rawPlayer.agent as any).name) {
            agentName = (rawPlayer.agent as any).name
        }
    }

    const player: Player = {
        id: rawPlayer.id,
        name: rawPlayer.name,
        surname: rawPlayer.surname,
        position: rawPlayer.position,
        description: rawPlayer.description,
        birthday: rawPlayer.birthday,
        categories,
        agentName,
    }

    return { props: { player } }
}

export default function PlayerDetailPage({ player }: Props) {
    const router = useRouter()
    if (!player) return null

    const birthDate = new Date(player.birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--

    const formatDate = (d: Date) =>
        d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })

    return (
        <>
            <Head>
                <title>
                    {player.name} {player.surname} — Detalle
                </title>
            </Head>

            <main className="bg-gray-800 min-h-screen py-12 px-6">
                <div className="max-w-md mx-auto bg-gray-900 border border-red-600 rounded-2xl p-8 shadow-lg shadow-red-600/20">
                    {/* Controles */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => router.back()}
                            className="text-red-400 hover:text-red-500 text-sm font-medium"
                        >
                            ← Volver
                        </button>
                        <Link
                            href={`/players/${player.id}/edit`}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-colors"
                        >
                            Editar
                        </Link>
                    </div>

                    {/* Cabecera */}
                    <h1 className="mt-6 text-3xl font-bold text-white border-b border-red-600 pb-2">
                        {player.name} {player.surname}
                    </h1>

                    {/* Detalles básicos */}
                    <dl className="mt-6 space-y-4 text-gray-300">
                        <div className="flex justify-between">
                            <dt className="font-medium">Posición</dt>
                            <dd className="text-white">{player.position}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-medium">Edad</dt>
                            <dd className="text-white">{age} años</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-medium">Nacimiento</dt>
                            <dd className="text-white">{formatDate(birthDate)}</dd>
                        </div>
                        <div>
                            <dt className="font-medium">Categorías</dt>
                            <dd className="mt-2 flex flex-wrap gap-2">
                                {player.categories && player.categories.length > 0 ? (
                                    player.categories.map((cat) => (
                                        <span
                                            key={cat}
                                            className="px-2 py-1 bg-red-600/20 text-red-300 text-sm rounded-full capitalize"
                                        >
                      {cat}
                    </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 text-sm">Sin categorías</span>
                                )}
                            </dd>
                        </div>
                    </dl>

                    {/* Representante */}
                    <section className="mt-6">
                        <h2 className="text-xl font-semibold text-red-500 mb-1">Representante</h2>
                        <p className="text-gray-200">
                            {player.agentName || 'Sin representante asignado'}
                        </p>
                    </section>

                    {/* Descripción */}
                    <section className="mt-6">
                        <h2 className="text-xl font-semibold text-red-500 mb-1">Descripción</h2>
                        <p className="text-gray-200 leading-relaxed">
                            {player.description || 'No hay descripción disponible.'}
                        </p>
                    </section>
                </div>
            </main>
        </>
    )
}
