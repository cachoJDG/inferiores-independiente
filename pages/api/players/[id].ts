// pages/api/players/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query

    // Validamos que id exista y no sea un array
    if (Array.isArray(id) || !id) {
        return res.status(400).json({ error: 'ID inválido' })
    }

    const playerId = parseInt(id, 10)
    if (Number.isNaN(playerId)) {
        return res.status(400).json({ error: 'ID no es un número válido' })
    }

    if (req.method === 'PUT') {
        const { name, surname, position, category, description, birthday } = req.body

        const { data, error } = await supabase
            .from('Players')
            .update({ name, surname, position, category, description, birthday })
            .eq('id', playerId)
            .select()

        if (error) {
            return res.status(500).json({ error: error.message })
        }
        return res.status(200).json(data)
    }

    if (req.method === 'DELETE') {
        const { error } = await supabase
            .from('Players')
            .delete()
            .eq('id', playerId)

        if (error) {
            return res.status(500).json({ error: error.message })
        }
        return res.status(204).end()
    }

    res.setHeader('Allow', ['PUT', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
}
