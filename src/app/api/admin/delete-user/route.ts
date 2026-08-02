import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'

export async function DELETE(request: Request) {
    const auth = await requireRole(['admin'])
    if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const targetUserId = new URL(request.url).searchParams.get('userId')
    if (!targetUserId || targetUserId === auth.user.id) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })

    const { error } = await auth.admin.auth.admin.deleteUser(targetUserId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await auth.admin.from('admin_audit_logs').insert({
        admin_user_id: auth.user.id,
        action: 'delete',
        resource_type: 'user',
        resource_id: targetUserId,
    })
    return NextResponse.json({ success: true })
}
