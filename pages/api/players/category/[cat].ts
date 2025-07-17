// pages/api/players/category/[cat].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { cat } = req.query
    if (Array.isArray(cat)) return res.status(400).end()

    // 1) Busco el id de la categoría
    const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('name', cat as string)
        .single()
    if (catErr || !catData) {
        return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    // 2) Traigo todos los player_id que tienen esa categoría
    const { data: rels, error: relErr } = await supabase
        .from('player_categories')
        .select('player_id')
        .eq('category_id', catData.id)
    if (relErr) {
        return res.status(500).json({ error: relErr.message })
    }

    const ids = rels.map(r => r.player_id)
    if (ids.length === 0) {
        return res.status(200).json([])  // ningún jugador en esa cat
    }

    // 3) Traigo los Players cuyo id esté en ese array
    const { data, error } = await supabase
        .from('Players')
        .select('*')
        .in('id', ids)

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(data)
}
