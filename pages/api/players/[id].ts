// pages/api/players/[id].ts
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Sólo PUT / DELETE
    if (!["PUT", "DELETE"].includes(req.method || "")) {
        res.setHeader("Allow", ["PUT", "DELETE"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Autenticación + admin
    const auth = await requireAdmin(req, res)
    if (!auth) return // requireAdmin ya envió 401/403

    // ID válido
    const { id } = req.query
    if (Array.isArray(id) || isNaN(Number(id))) {
        return res.status(400).json({ error: "ID de jugador inválido" })
    }
    const playerId = Number(id)

    try {
        if (req.method === "PUT") {
            // Separamos categories y descartamos cualquier id que viniera
            const { categories, id: _ignore, ...updates } = req.body

            // Si vienen categories, solo validamos que sea un array
            if (categories !== undefined && !Array.isArray(categories)) {
                return res
                    .status(400)
                    .json({ error: "categories debe ser un array" })
            }

            // Limpio null/undefined de los demás campos
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(
                    ([, v]) => v !== undefined && v !== null
                )
            )

            // 1) Actualizo la tabla Players (si hay fields)
            let updatedPlayer: any = {}
            if (Object.keys(cleanUpdates).length > 0) {
                const { data, error } = await auth.supabase
                    .from("Players")
                    .update(cleanUpdates)
                    .eq("id", playerId)
                    .select()
                if (error) {
                    console.error("[PLAYERS] Error updating player:", error)
                    return res
                        .status(500)
                        .json({ error: "Error al actualizar el jugador" })
                }
                if (!data || data.length === 0) {
                    return res.status(404).json({ error: "Jugador no encontrado" })
                }
                updatedPlayer = data[0]
            }

            // 2) Si mandan categories, refrescamos la relación many-to-many
            if (Array.isArray(categories)) {
                // 2.1) Obtengo los ids de las categorías existentes
                const { data: catRows, error: catErr } = await auth.supabase
                    .from("categories")
                    .select("id, name")
                    .in("name", categories)
                if (catErr) {
                    console.error("[CATS] Error fetching categories:", catErr)
                    return res
                        .status(500)
                        .json({ error: "Error al verificar las categorías" })
                }
                // 2.2) Compruebo si faltan nombres
                const foundNames = catRows.map(c => c.name)
                const missing = categories.filter((c: string) => !foundNames.includes(c))
                if (missing.length > 0) {
                    return res
                        .status(400)
                        .json({ error: `Categorías no encontradas: ${missing.join(", ")}` })
                }
                // 2.3) Borro las viejas
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
                // 2.4) Inserto las nuevas
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

            // 3) Recupero el listado final de categorías del jugador
            const { data: rels, error: relErr } = await auth.supabase
                .from("player_categories")
                .select("categories(name)")
                .eq("player_id", playerId)
            if (relErr) {
                console.error("[PC] Error fetching updated relations:", relErr)
                return res
                    .status(500)
                    .json({ error: "Error al obtener categorías actualizadas" })
            }
            const finalCategories = rels.map((r: any) => r.categories.name)

            // 4) Devuelvo el objeto combinado
            return res.status(200).json({
                message: "Jugador actualizado exitosamente",
                player: {
                    id: playerId,
                    ...updatedPlayer,
                    categories: finalCategories,
                },
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
            return res
                .status(200)
                .json({ message: "Jugador eliminado exitosamente" })
        }
    } catch (err) {
        console.error("[PLAYERS] Unexpected error:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
