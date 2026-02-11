import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if user has a profile
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                // If no profile, redirect to onboarding
                if (!profile) {
                    return NextResponse.redirect(`${origin}/onboarding`)
                }
            }

            // Otherwise redirect to dashboard
            return NextResponse.redirect(`${origin}/dashboard`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
