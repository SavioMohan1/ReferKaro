import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function requireUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null
    return { user, supabase }
}

export async function requireRole(allowedRoles: string[]) {
    const session = await requireUser()
    if (!session) return null

    const admin = createAdminClient()
    const { data: profile, error } = await admin
        .from('profiles')
        .select('id, email, role, is_verified, is_banned, company, designation, work_email, work_email_verified_at')
        .eq('id', session.user.id)
        .single()

    if (error || !profile || profile.is_banned || !allowedRoles.includes(profile.role)) return null
    return { ...session, profile, admin }
}
