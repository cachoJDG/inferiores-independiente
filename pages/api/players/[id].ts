import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/supabaseClient"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query

    if (Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid ID" })
    }

    if (req.method === "PUT") {
        const { name, surname, position, category, description, birthday } = req.body

        const { data, error } = await supabase
            .from("Players")
            .update({ name, surname, position, category, description, birthday })
            .eq("id", Number.parseInt(id))
            .select()

        if (error) {
            return res.status(500).json({ error: error.message })
        }
        return res.status(200).json(data[0])
    }

    if (req.method === "DELETE") {
        const { data, error } = await supabase.from("Players").delete().eq("id", Number.parseInt(id))

        if (error) {
            return res.status(500).json({ error: error.message })
        }
        return res.status(200).json({ message: "Player deleted successfully" })
    }

    res.setHeader("Allow", ["PUT", "DELETE"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
}
