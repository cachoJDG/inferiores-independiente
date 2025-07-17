// pages/api/players/index.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Sólo permitir POST
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Verificar autenticación y admin
    const auth = await requireAdmin(req, res)
    if (!auth) return // requireAdmin ya envió 401/403

    // Desestructuro ahora `categories` en vez de `category`
    const {
        name,
        surname,
        position,
        categories,
        description,
        birthday,
    } = req.body

    // Validar datos requeridos
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

    try {
        // 1) Inserto en tabla Players sin categoría
        const { data: playerRows, error: insertErr } = await auth.supabase
            .from("Players")
            .insert([
                {
                    name: name.trim(),
                    surname: surname.trim(),
                    position: Number(position),
                    description: description?.trim() || "",
                    birthday,
                },
            ])
            .select("id")
            .single() // retorna sólo el id
        if (insertErr) {
            console.error("Error creando player:", insertErr)
            return res.status(500).json({ error: "Error al crear el jugador" })
        }
        const playerId = playerRows.id

        // 2) Obtengo los ids de las categorías enviadas
        const { data: catRows, error: catErr } = await auth.supabase
            .from("categories")
            .select("id, name")
            .in("name", categories)
        if (catErr) {
            console.error("Error buscando categories:", catErr)
            return res
                .status(500)
                .json({ error: "Error al verificar las categorías" })
        }

        // 2.1) Compruebo que todas las categorías existan
        const foundNames = catRows.map((c) => c.name)
        const missing = categories.filter((c: string) => !foundNames.includes(c))
        if (missing.length > 0) {
            return res
                .status(400)
                .json({ error: `Categorías no encontradas: ${missing.join(", ")}` })
        }

        // 3) Inserto en player_categories
        const toInsert = catRows.map((c) => ({
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
                .json({ error: "Error al asignar las categorías al jugador" })
        }

        // 4) Devuelvo al cliente el jugador creado (puedes añadir más campos si quieres)
        return res.status(201).json({
            message: "Jugador creado exitosamente",
            player: {
                id: playerId,
                name: name.trim(),
                surname: surname.trim(),
                position: Number(position),
                description: description?.trim() || "",
                birthday,
                categories, // devolvemos los nombres de las categorías
            },
        })
    } catch (err) {
        console.error("Unexpected error:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
