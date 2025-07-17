import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Solo permitir GET
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Verificar autenticación y permisos de admin
    const auth = await requireAdmin(req, res)
    if (!auth) return // requireAdmin ya envió la respuesta de error

    try {
        const { data, error } = await auth.supabase.from("Usuarios").select("*").order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching users:", error)
            return res.status(500).json({ error: "Error al obtener usuarios" })
        }

        return res.status(200).json({
            message: "Usuarios obtenidos exitosamente",
            users: data || [],
        })
    } catch (error) {
        console.error("Unexpected error:", error)
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
