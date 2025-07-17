// components/AuthForm.tsx
'use client'

import { useState } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'

export default function AuthForm() {
    const supabase = useSupabaseClient()
    const session = useSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) alert(error.message)
    }
    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    if (session) {
        return (
            <div className="p-4 border rounded mb-6">
                <p>
                    Conectado como <strong>{session.user.email}</strong>
                </p>
                <button
                    onClick={handleLogout}
                    className="mt-2 px-4 py-2 bg-gray-700 rounded text-white"
                >
                    Cerrar sesión
                </button>
            </div>
        )
    }

    return (
        <div className="p-4 border rounded mb-6">
            <h2 className="mb-4 text-xl text-white">Iniciar sesión</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full mb-2 p-2 border rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full mb-4 p-2 border rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Entrar
            </button>
        </div>
    )
}
