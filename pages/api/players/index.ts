// pages/api/players/index.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Sólo permitir POST
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Verificar autenticación y admin
    const auth = await requireAdmin(req, res)
    if (!auth) return // requireAdmin ya envió 401/403

    const { name, surname, position, category, description, birthday } = req.body

    // Validar datos requeridos
    if (!name || !surname || !position || !category || !birthday) {
        return res.status(400).json({
            error: "Faltan campos requeridos: name, surname, position, category, birthday",
        })
    }

    try {
        const { data, error } = await auth.supabase
            .from("Players")
            .insert([
                {
                    name: name.trim(),
                    surname: surname.trim(),
                    position: Number(position),
                    category: category.trim(),
                    description: description?.trim() || "",
                    birthday,
                },
            ])
            .select()

        if (error) {
            console.error("Error creating player:", error)
            return res.status(500).json({ error: "Error al crear el jugador" })
        }

        return res.status(201).json({
            message: "Jugador creado exitosamente",
            player: data[0],
        })
    } catch (err) {
        console.error("Unexpected error:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
