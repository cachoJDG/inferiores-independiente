// lib/serverAuth.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"

export interface AuthResult {
    supabase: any
    session: any
    user: any
    isAdmin: boolean
}

export async function requireAuth(
    req: NextApiRequest,
    res: NextApiResponse,
    requireAdmin = false
): Promise<AuthResult | null> {
    const supabase = createPagesServerClient({ req, res })

    // 1) Verificar sesión
    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
        res.status(401).json({ error: "Error de sesión" })
        return null
    }
    if (!session) {
        res.status(401).json({ error: "No autorizado – debes iniciar sesión" })
        return null
    }

    // 2) Verificar perfil
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle()

    if (profileError) {
        res.status(500).json({ error: "Error interno" })
        return null
    }
    if (!profile) {
        res
            .status(requireAdmin ? 403 : 401)
            .json({ error: "Usuario no registrado" })
        return null
    }

    const isAdmin = !!profile.is_admin

    // 3) Verificar admin si se requiere
    if (requireAdmin && !isAdmin) {
        res
            .status(403)
            .json({ error: "Acceso denegado – permisos de admin requeridos" })
        return null
    }

    // 4) Autenticación y autorización ok
    return { supabase, session, user: session.user, isAdmin }
}

// Helpers
export function requireLogin(req: NextApiRequest, res: NextApiResponse) {
    return requireAuth(req, res, false)
}
export function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
    return requireAuth(req, res, true)
}
