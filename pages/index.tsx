// pages/index.tsx
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import AddPlayerModal from '../components/AddPlayerModal'

const years = Array.from({ length: 2018 - 2003 + 1 }, (_, i) =>
    (2018 - i).toString()
)
const squads = [
    'Reserva','Cuarta','Quinta','Sexta',
    'Séptima','Octava','Novena'
]

export default function Home() {
    const [showModal, setShowModal] = useState(false)
    const [reloadFlag, setReloadFlag] = useState(false)

    return (
        <>
            <Head>
                <title>{`Movimiento Paladar Negro`}</title>
                <meta name="description" content="Seguimiento de jugadores de inferiores" />
            </Head>

            <main className="min-h-screen bg-black text-white px-6 py-12">
                {/* Header principal */}
                <header className="text-center mb-16">
                    <h1 className="text-6xl font-extrabold mb-4">Movimiento Paladar Negro</h1>
                    <p className="text-xl opacity-80">Juveniles de Independiente de Avellaneda</p>
                    <button
                        onClick={() => {
                            console.log('Abriendo modal')
                            setShowModal(true)
                        }}
                        className="mt-6 px-6 py-3 bg-white text-ind-red font-bold rounded shadow hover:shadow-lg transition"
                    >
                        + Agregar Jugador
                    </button>
                </header>

                {/* Carousel Años */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-6">Por Año de Nacimiento</h2>
                    <div className="overflow-x-auto flex space-x-6 snap-x snap-mandatory scrollbar-hide px-4 py-4">
                        {years.map((year) => (
                            <Link
                                key={year}
                                href={`/year/${year}`}
                                className="snap-start flex-none w-48 h-48 bg-ind-red hover:bg-red-600 rounded-lg
                           flex flex-col items-center justify-center text-3xl font-semibold
                           transition-transform hover:scale-105"
                            >
                                {year}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Carousel Categorías de Equipo */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-6">Por Categoría de Equipo</h2>
                    <div className="overflow-x-auto flex space-x-6 snap-x snap-mandatory scrollbar-hide px-4 py-4">
                        {squads.map((cat) => (
                            <Link
                                key={cat}
                                href={`/category/${cat.toLowerCase()}`}
                                className="snap-start flex-none w-48 h-48 bg-ind-blue hover:bg-blue-700 rounded-lg
                           flex items-center justify-center text-2xl font-medium text-white
                           transition-transform hover:scale-105"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center mt-16">
                    <p className="opacity-75">&copy; 2025 Movimiento Paladar Negro</p>
                </footer>
            </main>

            {showModal && (
                <AddPlayerModal
                    onClose={() => setShowModal(false)}
                    onCreated={() => setReloadFlag((f) => !f)}
                />
            )}
        </>
    )
}
