// pages/api/agents/index.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdmin } from "@/lib/serverAuth"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const auth = await requireAdmin(req, res)
    if (!auth) return

    const { data: agents, error } = await auth.supabase
        .from("agents")
        .select("id, name")
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching agents:", error)
        return res.status(500).json({ error: "Error al obtener representantes" })
    }

    res.status(200).json(agents)
}
