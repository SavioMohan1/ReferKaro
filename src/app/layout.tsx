import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import GlobalNavbar from '@/components/layout/global-navbar'

const displayFont = Fraunces({
    subsets: ['latin'],
    variable: '--font-display',
    display: 'swap',
})

const interfaceFont = Manrope({
    subsets: ['latin'],
    variable: '--font-interface',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'ReferKaro | A clearer path to referrals',
    description: 'A beta platform for job seekers to request referrals and employees to review candidates through a tracked workflow.',
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
        <html lang="en" className={`${displayFont.variable} ${interfaceFont.variable}`}>
            <body>
                <GlobalNavbar user={user} profile={profile} />
                <main className="site-main">
                    {children}
                </main>
            </body>
        </html>
    )
}
