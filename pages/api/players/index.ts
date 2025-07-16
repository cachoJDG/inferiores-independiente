import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { name, surname, position, category, description, birthday } = req.body

        const { data, error } = await supabase
            .from('Players')
            .insert([{ name, surname, position, category, description, birthday }])

        if (error) {
            return res.status(500).json({ error: error.message })
        }
        return res.status(201).json(data)
    }

    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
}
