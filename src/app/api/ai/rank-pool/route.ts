import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'

export const maxDuration = 300

export async function POST(request: Request) {
    const auth = await requireRole(['employee'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = rateLimit(getRequestIdentifier(request, auth.user.id), { limit: 2, windowSeconds: 300 })
    if (!limited.success) return NextResponse.json({ error: 'Please wait before starting another ranking.' }, { status: 429 })

    try {
        const { jobId } = await request.json()
        if (!jobId) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
        const { rankResumePool } = await import('@/lib/ai/resume-ranking')
        const result = await rankResumePool({ jobId, requestedBy: auth.user.id, triggerKind: 'manual' })
        return NextResponse.json({ success: true, ...result })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ranking failed'
        return NextResponse.json({ error: message }, { status: message.includes('limit') ? 409 : 400 })
    }
}
