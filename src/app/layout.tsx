import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

import { createClient } from '@/lib/supabase/server'
import GlobalNavbar from '@/components/layout/global-navbar'

export const metadata: Metadata = {
    title: 'ReferKaro — Get Referred, Not Ignored',
    description: 'ReferKaro connects job seekers with verified employees who submit real referrals. Skip the ATS black hole.',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = data
    }

    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen flex flex-col`}>
                <GlobalNavbar user={user} profile={profile} />
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
            </body>
        </html>
    )
}
