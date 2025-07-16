// pages/api/usuarios.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { data, error } = await supabase
        .from('Usuarios')       // nombre exacto de tu tabla
        .select('*')            // trae todos los campos

    // Loguea en consola del servidor para debug:
    console.log('Supabase response:', { data, error })

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(data)
}
