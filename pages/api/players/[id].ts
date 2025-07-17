// pages/api/players/[id].ts
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Solo permitir PUT y DELETE
    if (!["PUT", "DELETE"].includes(req.method || "")) {
        res.setHeader("Allow", ["PUT", "DELETE"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Verificar que sea un admin
    const auth = await requireAdmin(req, res)
    if (!auth) {
        return // requireAdmin ya envió 401/403
    }

    const { id } = req.query
    if (Array.isArray(id) || isNaN(Number(id))) {
        return res.status(400).json({ error: "ID de jugador inválido" })
    }
    const playerId = Number(id)

    try {
        if (req.method === "PUT") {
            const updates = req.body
            if (!updates || Object.keys(updates).length === 0) {
                return res.status(400).json({ error: "No hay datos para actualizar" })
            }

            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(
                    ([, value]) => value !== undefined && value !== null,
                ),
            )

            const { data, error } = await auth.supabase
                .from("Players")
                .update(cleanUpdates)
                .eq("id", playerId)
                .select()

            if (error) {
                console.error("[PLAYERS] Error updating player:", error)
                return res.status(500).json({ error: "Error al actualizar el jugador" })
            }
            if (!data || data.length === 0) {
                return res.status(404).json({ error: "Jugador no encontrado" })
            }

            return res.status(200).json({
                message: "Jugador actualizado exitosamente",
                player: data[0],
            })
        }

        if (req.method === "DELETE") {
            const { error } = await auth.supabase
                .from("Players")
                .delete()
                .eq("id", playerId)

            if (error) {
                console.error("[PLAYERS] Error deleting player:", error)
                return res.status(500).json({ error: "Error al eliminar el jugador" })
            }

            return res.status(200).json({
                message: "Jugador eliminado exitosamente",
            })
        }
    } catch (err) {
        console.error("[PLAYERS] Unexpected error:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
