import 'server-only'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

function isPrivateAddress(address: string) {
    const normalised = address.toLowerCase()
    if (normalised === '::' || normalised === '::1' || normalised.startsWith('fc') || normalised.startsWith('fd') || normalised.startsWith('fe8') || normalised.startsWith('fe9') || normalised.startsWith('fea') || normalised.startsWith('feb')) return true
    const ipv4 = normalised.startsWith('::ffff:') ? normalised.slice(7) : normalised
    if (isIP(ipv4) !== 4) return false
    const [a, b] = ipv4.split('.').map(Number)
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && (b === 0 || b === 168)) ||
        (a === 198 && (b === 18 || b === 19))
}

function normaliseTokens(value: string) {
    return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((token) => token.length > 2))
}

function includesEnough(haystack: string, value: string, threshold: number) {
    const tokens = [...normaliseTokens(value)]
    if (!tokens.length) return false
    return tokens.filter((token) => haystack.includes(token)).length / tokens.length >= threshold
}

async function assertPublicHost(url: URL) {
    const hostname = url.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname.endsWith('.local')) throw new Error('Private hosts are not allowed')
    const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true })
    for (const { address } of addresses) {
        if (isPrivateAddress(address)) {
            throw new Error('Private hosts are not allowed')
        }
    }
}

async function readLimitedText(response: Response, maxBytes: number) {
    const contentLength = Number(response.headers.get('content-length') || 0)
    if (contentLength > maxBytes) throw new Error('The posting page is too large to verify automatically')
    if (!response.body) return ''
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let total = 0
    let text = ''
    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        total += value.byteLength
        if (total > maxBytes) { await reader.cancel(); throw new Error('The posting page is too large to verify automatically') }
        text += decoder.decode(value, { stream: true })
    }
    return text + decoder.decode()
}

export async function verifyOfficialJobUrl(rawUrl: string, company: string, roleTitle: string) {
    try {
        let url = new URL(rawUrl)
        let response: Response | null = null
        for (let redirects = 0; redirects <= 3; redirects += 1) {
            if (url.protocol !== 'https:') return { status: 'mismatch' as const, feedback: 'The official posting and redirects must use HTTPS.' }
            await assertPublicHost(url)
            response = await fetch(url, {
                headers: { 'User-Agent': 'ReferKaro job verification/1.0' },
                redirect: 'manual',
                signal: AbortSignal.timeout(8000),
            })
            if (![301, 302, 303, 307, 308].includes(response.status)) break
            const location = response.headers.get('location')
            if (!location || redirects === 3) throw new Error('The posting redirected too many times')
            url = new URL(location, url)
        }
        if (!response) throw new Error('The page could not be fetched')
        if (!response.ok) return { status: 'unreachable' as const, feedback: `The posting returned HTTP ${response.status}; an admin must review it manually.` }

        const html = await readLimitedText(response, 750_000)
        const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
        const companyMatches = includesEnough(`${url.hostname} ${text}`, company, 0.5)
        const roleMatches = includesEnough(text, roleTitle, 0.6)

        if (companyMatches && roleMatches) return { status: 'matched' as const, feedback: 'The official page contains matching company and role details.' }
        return { status: 'mismatch' as const, feedback: 'The fetched page did not contain enough matching company and role terms. Admin review is required.' }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'The page could not be fetched'
        return { status: 'unreachable' as const, feedback: `${message}. An admin must review the link manually.` }
    }
}
