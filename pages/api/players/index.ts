// pages/api/players/index.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

type CategoryRow = { id: number; name: string }

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const auth = await requireAdmin(req, res)
    if (!auth) return
    console.log("🛠️ [players] req.body:", JSON.stringify(req.body))


    const {
        name,
        surname,
        position,
        categories,
        description,
        birthday,
        agent_id,
    } = req.body as {
        name?: string
        surname?: string
        position?: number | string
        categories?: unknown
        description?: string
        birthday?: string
        agent_id?: number | string
    }

    if (
        !name ||
        !surname ||
        !position ||
        !Array.isArray(categories) ||
        categories.length === 0 ||
        !birthday
    ) {
        return res.status(400).json({
            error:
                "Faltan campos requeridos: name, surname, position, categories (array no vacío), birthday",
        })
    }

    // Convertir agent_id a number o null
    const agentIdValue =
        agent_id != null && agent_id !== ""
            ? Number(agent_id)
            : null

    try {
        // 1) Insertar jugador
        console.log("🛠️ [players] insertando jugador:", {
            name,
            surname,
            position,
            description,
            birthday,
            agent_id: agentIdValue,
        })
        const { data: playerRow, error: insertErr } = await auth.supabase
            .from("Players")
            .insert([
                {
                    name: name.trim(),
                    surname: surname.trim(),
                    position: Number(position),
                    description: description?.trim() || "",
                    birthday,
                    agent_id: agentIdValue,
                },
            ])
            .select("id")
            .single()
        if (insertErr || !playerRow) {
            console.error("Error creando player:", insertErr)
            return res.status(500).json({ error: "Error al crear el jugador" })
        }
        const playerId = playerRow.id

        // 2) Obtener categorías
        const { data: catRowsRaw, error: catErr } = await auth.supabase
            .from("categories")
            .select("id, name")
            .in("name", categories as string[])
        if (catErr) {
            console.error("Error buscando categories:", catErr)
            return res.status(500).json({ error: "Error verificando categorías" })
        }
        const catRows: CategoryRow[] = catRowsRaw ?? []

        // 2.1) Validar que existan todas
        const foundNames = catRows.map(c => c.name)
        const missing = (categories as string[]).filter(c => !foundNames.includes(c))
        if (missing.length > 0) {
            return res
                .status(400)
                .json({ error: `Categorías no encontradas: ${missing.join(", ")}` })
        }

        // 3) Insertar en player_categories
        const toInsert = catRows.map(c => ({
            player_id: playerId,
            category_id: c.id,
        }))
        const { error: pcErr } = await auth.supabase
            .from("player_categories")
            .insert(toInsert)
        if (pcErr) {
            console.error("Error insertando player_categories:", pcErr)
            return res
                .status(500)
                .json({ error: "Error asignando categorías al jugador" })
        }

        // 4) Responder con el jugador creado
        return res.status(201).json({
            message: "Jugador creado exitosamente",
            player: {
                id: playerId,
                name: name.trim(),
                surname: surname.trim(),
                position: Number(position),
                description: description?.trim() || "",
                birthday,
                agent_id: agentIdValue,
                categories: categories as string[],
            },
        })
    } catch (err) {
        console.error("Unexpected error:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
