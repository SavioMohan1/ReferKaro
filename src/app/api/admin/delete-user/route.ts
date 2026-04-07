import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = "saviomohan2002@gmail.com"

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('userId')

        if (!targetUserId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        // 1. Verify the requester is the Admin
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || user.email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // 2. Initialize Supabase with Service Role Key (Admin Access)
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 3. Delete the user from Auth (This will cascade to profiles if DB is set up that way, otherwise we might need to delete profile manually too)
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

        if (deleteAuthError) {
            console.error("Error deleting user from Auth:", deleteAuthError)
            return NextResponse.json({ error: deleteAuthError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' })

    } catch (error: any) {
        console.error('Delete User Route Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 })
    }
}
