// pages/api/players/category/[cat].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { cat } = req.query
    if (Array.isArray(cat)) return res.status(400).end()

    const { data, error } = await supabase
        .from('Players')
        .select('*')
        .eq('category', cat as string)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
}
