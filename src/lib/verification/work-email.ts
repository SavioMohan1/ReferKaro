import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

const FREE_EMAIL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com',
    'hotmail.com', 'live.com', 'icloud.com', 'proton.me', 'protonmail.com',
    'aol.com', 'mail.com', 'zoho.com', 'yandex.com',
])

export function normalizeWorkEmail(value: unknown) {
    return typeof value === 'string' ? value.trim().toLowerCase() : ''
}
export function validateWorkEmail(value: unknown) {
    const email = normalizeWorkEmail(value)
    const match = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(email)
    if (!match) return { valid: false as const, error: 'Enter a valid work email address' }
    if (FREE_EMAIL_DOMAINS.has(match[1])) {
        return { valid: false as const, error: 'Use your organisation-issued work email, not a personal mailbox' }
    }
    return { valid: true as const, email }
}

function otpSecret() {
    const secret = process.env.WORK_EMAIL_OTP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!secret) throw new Error('Work-email OTP secret is not configured')
    return secret
}

export function digestWorkEmailOtp(userId: string, email: string, code: string) {
    return createHmac('sha256', otpSecret()).update(`${userId}|${email}|${code}`).digest('hex')
}

export function otpDigestsMatch(expected: string, actual: string) {
    const left = Buffer.from(expected, 'hex')
    const right = Buffer.from(actual, 'hex')
    return left.length === right.length && timingSafeEqual(left, right)
}
