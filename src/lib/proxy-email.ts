import crypto from 'crypto'

function sanitizeTag(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
}

export function createProxyAddress(seed?: string) {
    const testmailNamespace = process.env.TESTMAIL_NAMESPACE?.trim()
    if (testmailNamespace) {
        const prefix = sanitizeTag(process.env.TESTMAIL_TAG_PREFIX || 'referkaro')
        const seedPart = seed ? sanitizeTag(seed).slice(0, 12) : ''
        const randomPart = crypto.randomBytes(4).toString('hex')
        const tag = `${prefix}${seedPart}${randomPart}`.slice(0, 64)
        return `${testmailNamespace}.${tag}@inbox.testmail.app`
    }

    if (process.env.PROXY_EMAIL) {
        return process.env.PROXY_EMAIL
    }

    const domain = process.env.PROXY_EMAIL_DOMAIN || 'referkaro.app'
    return `ref-${crypto.randomBytes(4).toString('hex')}@${domain}`
}
