"use client"

import Head from "next/head"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AuthForm from "@/components/AuthForm"
import { useSession } from "@supabase/auth-helpers-react"
import AddPlayerModal from "@/components/AddPlayerModal"

const years = Array.from({ length: 2018 - 2003 + 1 }, (_, i) => (2018 - i).toString())
const squads = ["Reserva", "Cuarta", "Quinta", "Sexta", "Septima", "Octava", "Novena"]

interface CarouselProps {
    title: string
    items: string[]
    baseHref: string
    colorClass: string
    hoverColorClass: string
}

function Carousel({ title, items, baseHref, colorClass, hoverColorClass }: CarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
        }
    }

    useEffect(() => {
        checkScrollButtons()
        const handleResize = () => checkScrollButtons()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 320 // Ancho de card + gap
            const newScrollLeft = scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)
            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            })
        }
    }

    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">{title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded-full transition-all duration-200 ${
                            canScrollLeft ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white/5 text-white/30 cursor-not-allowed"
                        }`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className={`p-2 rounded-full transition-all duration-200 ${
                            canScrollRight
                                ? "bg-white/10 hover:bg-white/20 text-white"
                                : "bg-white/5 text-white/30 cursor-not-allowed"
                        }`}
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="relative group">
                <div
                    ref={scrollRef}
                    onScroll={checkScrollButtons}
                    className="flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth pb-4
                             scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]
                             [&::-webkit-scrollbar]:hidden"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {items.map((item, index) => (
                        <Link
                            key={item}
                            href={`${baseHref}${item.toLowerCase()}`}
                            className={`flex-none w-72 h-48 ${colorClass} ${hoverColorClass} rounded-xl
                                       flex flex-col items-center justify-center text-2xl font-semibold
                                       transition-all duration-300 hover:scale-105 hover:shadow-2xl
                                       transform-gpu will-change-transform
                                       border border-white/10 hover:border-white/20
                                       backdrop-blur-sm relative overflow-hidden group/card`}
                        >
                            {/* Efecto de brillo en hover */}
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                                          translate-x-[-100%] group-hover/card:translate-x-[100%]
                                          transition-transform duration-1000 ease-out"
                            />

                            <div className="relative z-10 text-center">
                                <div className="text-3xl font-bold mb-2">{item}</div>
                                {baseHref.includes("year") && <div className="text-sm opacity-75">Nacidos en {item}</div>}
                                {baseHref.includes("category") && <div className="text-sm opacity-75">División {item}</div>}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Gradientes de fade en los bordes */}
                <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
            </div>
        </section>
    )
}

export default function Home() {
    const session = useSession()
    const [showModal, setShowModal] = useState(false)
    const [reloadFlag, setReloadFlag] = useState(false)

    return (
        <>
            <Head>
                <title>Movimiento Paladar Negro</title>
                <meta name="description" content="Seguimiento de jugadores de inferiores" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
                <div className="container mx-auto px-4 py-12 max-w-7xl">
                    {/* Header principal */}
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                            Movimiento Paladar Negro
                        </h1>
                        <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
                            Seguimiento y desarrollo de juveniles de Independiente de Avellaneda
                        </p>
                    </header>

                    {/* Form de login/logout */}
                    <div className="max-w-sm mx-auto mb-12">
                        <AuthForm />
                    </div>

                    {/* Botón "+ Agregar Jugador" sólo si estás logueado */}
                    {session && (
                        <div className="text-center mb-16">
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
                                         text-white font-bold rounded-xl shadow-lg hover:shadow-xl
                                         transition-all duration-300 transform hover:scale-105
                                         border border-red-500/20"
                            >
                                + Agregar Jugador
                            </button>
                        </div>
                    )}

                    {/* Carousel Años */}
                    <Carousel
                        title="Por Año de Nacimiento"
                        items={years}
                        baseHref="/year/"
                        colorClass="bg-gradient-to-br from-red-600 to-red-800"
                        hoverColorClass="hover:from-red-500 hover:to-red-700"
                    />

                    {/* Carousel Categorías de Equipo */}
                    <Carousel
                        title="Por Categoría de Equipo"
                        items={squads}
                        baseHref="/category/"
                        colorClass="bg-gradient-to-br from-blue-600 to-blue-800"
                        hoverColorClass="hover:from-blue-500 hover:to-blue-700"
                    />

                    {/* Footer */}
                    <footer className="text-center mt-20 pt-8 border-t border-white/10">
                        <p className="opacity-75 text-sm">&copy; 2025 Movimiento Paladar Negro - Independiente de Avellaneda</p>
                    </footer>
                </div>
            </main>

            {showModal && <AddPlayerModal onClose={() => setShowModal(false)} onCreated={() => setReloadFlag((f) => !f)} />}
        </>
    )
}
