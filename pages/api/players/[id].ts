// pages/api/players/[id].ts
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

type CategoryRow = { id: number; name: string }
type PlayerCategoryRel = { categories: { name: string } }
type PlayerResponse = {
    id: number
    name?: string
    surname?: string
    position?: number
    description?: string
    birthday?: string
    [key: string]: any
    categories?: string[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Sólo PUT / DELETE
    if (!["PUT", "DELETE"].includes(req.method || "")) {
        res.setHeader("Allow", ["PUT", "DELETE"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Auth + admin
    const auth = await requireAdmin(req, res)
    if (!auth) return

    // ID válido
    const { id } = req.query
    if (Array.isArray(id) || isNaN(Number(id))) {
        return res.status(400).json({ error: "ID de jugador inválido" })
    }
    const playerId = Number(id)

    try {
        if (req.method === "PUT") {
            // Separamos categories y descartamos cualquier id
            const { categories, id: _ignore, ...updates } = req.body as {
                categories?: string[]
                id?: unknown
                [key: string]: any
            }

            // Si viene, solo validar que sea array
            if (categories !== undefined && !Array.isArray(categories)) {
                return res.status(400).json({ error: "categories debe ser un array" })
            }

            // Limpio null/undefined de fields normales
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(([, v]) => v != null)
            )

            // 1) Actualizo tabla Players si hay algo
            let updatedPlayer: Record<string, any> = {}
            if (Object.keys(cleanUpdates).length > 0) {
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
                updatedPlayer = data[0]
            }

            // 2) Si mandan categories, refrescamos M-N
            if (Array.isArray(categories)) {
                // 2.1) Traigo ids de categorías
                const { data: catRowsRaw, error: catErr } = await auth.supabase
                    .from("categories")
                    .select("id, name")
                    .in("name", categories)
                if (catErr) {
                    console.error("[CATS] Error fetching categories:", catErr)
                    return res
                        .status(500)
                        .json({ error: "Error al verificar las categorías" })
                }
                const catRows = (catRowsRaw ?? []) as CategoryRow[]

                // 2.2) Valido que no falte ninguna
                const foundNames = catRows.map(c => c.name)
                const missing = categories.filter(c => !foundNames.includes(c))
                if (missing.length > 0) {
                    return res
                        .status(400)
                        .json({ error: `Categorías no encontradas: ${missing.join(", ")}` })
                }

                // 2.3) Borro viejas
                const { error: delErr } = await auth.supabase
                    .from("player_categories")
                    .delete()
                    .eq("player_id", playerId)
                if (delErr) {
                    console.error("[PC] Error deleting old relations:", delErr)
                    return res
                        .status(500)
                        .json({ error: "Error al limpiar categorías previas" })
                }

                // 2.4) Inserto nuevas
                const toInsert = catRows.map(c => ({
                    player_id: playerId,
                    category_id: c.id,
                }))
                const { error: insErr } = await auth.supabase
                    .from("player_categories")
                    .insert(toInsert)
                if (insErr) {
                    console.error("[PC] Error inserting new relations:", insErr)
                    return res
                        .status(500)
                        .json({ error: "Error al asignar las nuevas categorías" })
                }
            }

            // 3) Traigo el array final de categorías
            const { data: relsRaw, error: relErr } = await auth.supabase
                .from("player_categories")
                .select("categories(name)")
                .eq("player_id", playerId)
            if (relErr) {
                console.error("[PC] Error fetching updated relations:", relErr)
                return res
                    .status(500)
                    .json({ error: "Error al obtener categorías actualizadas" })
            }
            const rels = (relsRaw ?? []) as PlayerCategoryRel[]
            const finalCategories = rels.map(r => r.categories.name)

            // 4) Devuelvo objeto completo
            const player: PlayerResponse = {
                id: playerId,
                ...updatedPlayer,
                categories: finalCategories,
            }
            return res.status(200).json({
                message: "Jugador actualizado exitosamente",
                player,
            })
        }

        // DELETE
        if (req.method === "DELETE") {
            const { error } = await auth.supabase
                .from("Players")
                .delete()
                .eq("id", playerId)
            if (error) {
                console.error("[PLAYERS] Error deleting player:", error)
                return res.status(500).json({ error: "Error al eliminar el jugador" })
            }
            return res.status(200).json({ message: "Jugador eliminado exitosamente" })
        }
    } catch (err) {
        console.error("[PLAYERS] Unexpected error:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
