import { NextResponse } from 'next/server'

export async function POST() {
    return NextResponse.json({
        error: 'Individual resume scoring was replaced by the audited full-pool ranking workflow.',
    }, { status: 410 })
}
