import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const headerStore = await headers()
    
    const options: any = {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // Ignore on server components
                }
            },
        },
    }

    const authHeader = headerStore.get('authorization')
    if (authHeader) {
        options.global = { headers: { Authorization: authHeader } }
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        options
    )
}
