import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminPanel from '@/components/admin/admin-panel'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')
    if (user.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

    return <AdminPanel />
}
