import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

type Player = {
    id: number
    name: string
    surname: string
    position: number
    description: string
    birthday: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Player[] | { error: string }>
) {
    const { year } = req.query
    if (Array.isArray(year)) {
        return res.status(400).json({ error: 'Invalid year' })
    }

    const from = `${year}-01-01`
    const to   = `${year}-12-31`

    const { data, error } = await supabase
        .from<Player>('Players')
        .select('id, name, surname, position, description, birthday')
        .gte('birthday', from)
        .lte('birthday', to)

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(data || [])
}
