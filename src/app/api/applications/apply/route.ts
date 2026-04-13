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

        // Step 1: Check user's token balance and role
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

        // Step 2: Fetch Job Details (referral_type + pool_size)
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('referral_type, pool_size, is_active')
            .eq('id', job_id)
            .single()

        if (jobError || !job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        if (!job.is_active) {
            return NextResponse.json({ error: 'This job is no longer active.' }, { status: 400 })
        }

        // Step 3: Check if already applied
        const { data: existingApplication } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', job_id)
            .eq('job_seeker_id', user.id)
            .single()

        if (existingApplication) {
            return NextResponse.json({ error: 'You have already applied to this job' }, { status: 400 })
        }

        // Step 4: If pooling job, call atomic RPC to check pool size and insert
        if (job.referral_type === 'pooling') {
            const poolSize = job.pool_size || 10

            const { data: rpcResult, error: rpcError } = await supabase.rpc('safe_pool_apply', {
                p_job_id: job_id,
                p_job_seeker_id: user.id,
                p_employee_id: employee_id,
                p_cover_letter: cover_letter,
                p_linkedin_url: linkedin_url || null,
                p_portfolio_url: portfolio_url || null,
                p_resume_url: resume_url || null,
                p_pool_size: poolSize,
                p_current_token_balance: profile.token_balance,
            })

            if (rpcError) {
                console.error('RPC error:', rpcError)
                return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
            }

            if (!rpcResult || rpcResult.success === false) {
                const reason = rpcResult?.reason || 'pool_full'
                if (reason === 'pool_full') {
                    return NextResponse.json({ error: 'This applicant pool is already full.' }, { status: 400 })
                }
                return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
            }

            // RPC succeeded — notify employee (non-blocking)
            notifyEmployee(supabase, employee_id, job_id, user.email)

            return NextResponse.json({
                success: true,
                message: 'Application submitted successfully to the pool!'
            })
        }

        // Step 5: Non-pooling (single referral) — standard flow
        // Deduct token (atomic update)
        const { error: tokenError } = await supabase
            .from('profiles')
            .update({ token_balance: profile.token_balance - 1 })
            .eq('id', user.id)

        if (tokenError) {
            console.error('Token deduction error:', tokenError)
            return NextResponse.json({ error: 'Failed to deduct token' }, { status: 500 })
        }

        // Create application
        const { data: application, error: applicationError } = await supabase
            .from('applications')
            .insert({
                job_id,
                job_seeker_id: user.id,
                employee_id,
                cover_letter,
                linkedin_url: linkedin_url || null,
                portfolio_url: portfolio_url || null,
                resume_url: resume_url || null,
                status: 'pending',
                referral_type: 'single',
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

        // Notify employee (non-blocking)
        notifyEmployee(supabase, employee_id, job_id, user.email)

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

async function notifyEmployee(supabase: any, employeeId: string, jobId: string, applicantEmail: string) {
    try {
        const { data: employee } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', employeeId)
            .single()

        if (employee && employee.email) {
            const { sendEmail } = await import('@/lib/resend')
            await sendEmail({
                to: employee.email,
                subject: `New Application for Job #${jobId}`,
                html: `
                    <h1>New Application Received! 🚀</h1>
                    <p>Hi ${employee.full_name || 'there'},</p>
                    <p>You have received a new application for your referral opening.</p>
                    <p><strong>Applicant:</strong> ${applicantEmail}</p>
                    <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard">View Application</a>
                `
            })
        }
    } catch (emailError) {
        console.error('Email sending failed (non-blocking):', emailError)
    }
}
