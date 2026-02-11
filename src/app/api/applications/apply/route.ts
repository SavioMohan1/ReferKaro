import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse request body
        const body = await request.json()
        const { job_id, employee_id, cover_letter, linkedin_url, portfolio_url, resume_url } = body

        if (!job_id || !employee_id || !cover_letter) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Step 1: Check user's token balance
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('token_balance, role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (profile.role !== 'job_seeker') {
            return NextResponse.json({ error: 'Only job seekers can apply' }, { status: 403 })
        }

        if (!profile.token_balance || profile.token_balance < 1) {
            return NextResponse.json({ error: 'Insufficient tokens. Please buy tokens to apply.' }, { status: 400 })
        }

        // Step 2: Check if already applied
        const { data: existingApplication } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', job_id)
            .eq('job_seeker_id', user.id)
            .single()

        if (existingApplication) {
            return NextResponse.json({ error: 'You have already applied to this job' }, { status: 400 })
        }

        // Step 3: Deduct token (atomic update)
        const { error: tokenError } = await supabase
            .from('profiles')
            .update({ token_balance: profile.token_balance - 1 })
            .eq('id', user.id)

        if (tokenError) {
            console.error('Token deduction error:', tokenError)
            return NextResponse.json({ error: 'Failed to deduct token' }, { status: 500 })
        }

        // Step 4: Create application
        const { data: application, error: applicationError } = await supabase
            .from('applications')
            .insert({
                job_id,
                job_seeker_id: user.id,
                employee_id,
                cover_letter,
                linkedin_url,
                portfolio_url,
                resume_url: resume_url || null,
                status: 'pending',
            })
            .select()
            .single()

        if (applicationError) {
            console.error('Application creation error:', applicationError)

            // Rollback: Refund token if application creation failed
            await supabase
                .from('profiles')
                .update({ token_balance: profile.token_balance })
                .eq('id', user.id)

            return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            application,
            message: 'Application submitted successfully!'
        })

    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
