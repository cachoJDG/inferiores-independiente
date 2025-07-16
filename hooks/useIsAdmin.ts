// hooks/useIsAdmin.ts
'use client'
import { useState, useEffect } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'

export function useIsAdmin() {
    const supabase = useSupabaseClient()
    const session = useSession()
    // null = cargando, false = no admin, true = admin
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

    useEffect(() => {
        if (!session) {
            setIsAdmin(false)
            return
        }

        ;(async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single()

            if (error) {
                console.error('useIsAdmin error:', error)
                setIsAdmin(false)
            } else {
                setIsAdmin(!!data?.is_admin)
            }
        })()
    }, [session, supabase])

    return isAdmin
}
